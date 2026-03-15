"""
Скрипт для заполнения Qdrant рецептами из JSON-файлов в static/.

Использование:
    python api/scripts/fill_recipes.py                          # загрузить всё
    python api/scripts/fill_recipes.py --batch-size 50          # размер батча
    python api/scripts/fill_recipes.py --sources povarenok      # только povarenok
    python api/scripts/fill_recipes.py --sources russianfood    # только russianfood
    python api/scripts/fill_recipes.py --dry-run                # только посчитать
"""

import argparse
import asyncio
import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "api"))

from models import Recipe


SOURCES = {
    "povarenok": ROOT / "static" / "Povarenok_recipes.json",
    "russianfood": ROOT / "static" / "recipes_rf_.json",
}


def load_recipes(path: Path) -> list[Recipe]:
    with open(path, encoding="utf-8") as f:
        raw = json.load(f)

    recipes = []
    skipped = 0
    for item in raw:
        name = (item.get("name") or "").strip()
        ingredients = item.get("ingredients", [])
        steps = item.get("steps", [])

        if not name or not ingredients:
            skipped += 1
            continue

        # ingredients: list[str] → str (через запятую, убираем лишние детали)
        if isinstance(ingredients, list):
            ingredients_str = ", ".join(ingredients)
        else:
            ingredients_str = str(ingredients)

        # steps: убеждаемся что это list[str]
        if isinstance(steps, str):
            steps = [steps]
        steps = [s for s in steps if s.strip()]

        recipes.append(Recipe(
            title=name,
            ingredients=ingredients_str,
            steps=steps,
        ))

    print(f"  {path.name}: загружено {len(recipes)}, пропущено {skipped}")
    return recipes


async def fill(sources: list[str], batch_size: int, dry_run: bool):
    all_recipes: list[Recipe] = []
    for source in sources:
        path = SOURCES[source]
        if not path.exists():
            print(f"  ПРЕДУПРЕЖДЕНИЕ: файл {path} не найден, пропускаем")
            continue
        all_recipes.extend(load_recipes(path))

    if len(all_recipes) > 10000:
        print(f"\nОграничение: берём 10000 из {len(all_recipes)} рецептов")
        all_recipes = all_recipes[:10000]

    print(f"\nВсего рецептов: {len(all_recipes)}")

    if dry_run:
        print("(dry-run, ничего не загружаем)")
        return

    from vector_store import vector_store as vs

    existing = await vs.count()
    print(f"Рецептов в Qdrant до загрузки: {existing}")

    total = len(all_recipes)
    total_ids = []
    start = time.time()

    for i in range(0, total, batch_size):
        batch = all_recipes[i : i + batch_size]
        ids = await vs.add_recipes(batch)
        total_ids.extend(ids)
        elapsed = time.time() - start
        done = i + len(batch)
        rate = done / elapsed if elapsed > 0 else 0
        eta = (total - done) / rate if rate > 0 else 0
        print(f"  [{done}/{total}] +{len(ids)} | {rate:.1f} рец/с | ETA {eta:.0f}с")

    elapsed = time.time() - start
    final_count = await vs.count()
    print(f"\nГотово за {elapsed:.1f}с. Добавлено {len(total_ids)} рецептов.")
    print(f"Рецептов в Qdrant: {final_count}")


def main():
    parser = argparse.ArgumentParser(description="Заполнение Qdrant рецептами")
    parser.add_argument(
        "--sources",
        nargs="+",
        choices=list(SOURCES.keys()),
        default=list(SOURCES.keys()),
        help="Источники данных (по умолчанию все)",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=100,
        help="Размер батча (по умолчанию 100)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Только загрузить и посчитать, не отправлять в Qdrant",
    )
    args = parser.parse_args()
    asyncio.run(fill(args.sources, args.batch_size, args.dry_run))


if __name__ == "__main__":
    main()
