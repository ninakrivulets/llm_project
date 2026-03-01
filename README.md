# Recipe RAG Assistant

> Участники: \
> Горбатюк Олег \
> Кривулец Нина \
> 

[Дизайн документ](./docs/DESIGN.md)

# Визуал

![image1.png](docs/images/image1.png)
![image2.png](docs/images/image2.png)


# Запуск

Создайте `.env` файл (на примере .env.example), и укажите `OPENAI_API_KEY` и `OPENAI_PROXY`

Запуск осуществляется:
```bash
docker compose up --build -d
```

Остановка:
```bash
docker compose down
```