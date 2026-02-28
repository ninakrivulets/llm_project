export default function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-3 text-text-secondary text-center px-10">
      <div className="text-5xl mb-2">🍳</div>
      <h2 className="text-[22px] font-semibold text-text">Чем могу помочь?</h2>
      <p className="text-sm max-w-[400px] leading-relaxed">
        Спросите что-нибудь вроде «ужин без глютена за 40 минут» или «десерт из
        того, что есть дома»
      </p>
    </div>
  );
}
