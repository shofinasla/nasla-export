import Link from "next/link";

export default function Home() {
  return <main>
    <section className="bg-slate-950 py-24 text-white">
      <div className="container">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-slate-300">Digital Platform for Global Business</p>
          <h1 className="text-5xl font-black tracking-tight md:text-7xl">Build your digital business infrastructure.</h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">Domain, website templates, development and export digitalization in one platform.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn bg-white text-slate-950" href="/templates">Explore Templates</Link>
            <Link className="btn border border-slate-600 text-white" href="/export">Export Digitalization</Link>
          </div>
        </div>
      </div>
    </section>
    <section className="container grid gap-5 py-16 md:grid-cols-4">
      {[
        ["Domains","Find the right domain for your business."],
        ["Templates","Ready-to-customize professional websites."],
        ["Services","Development, SEO and digital services."],
        ["Export","Digital infrastructure for export businesses."]
      ].map(([title,desc]) => <div className="card" key={title}><h2 className="text-xl font-black">{title}</h2><p className="mt-2 text-sm text-slate-500">{desc}</p></div>)}
    </section>
  </main>;
}