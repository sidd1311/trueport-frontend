import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <Head>
        <title>TruePortMe - Verified Digital Portfolio</title>
        <meta name="description" content="Create and verify your professional experiences with TruePortMe" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        {/* HERO */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
              Build a <span className="text-primary-600">Verified</span> Portfolio employers trust
            </h1>
            <p className="mt-4 text-gray-600 max-w-xl mx-auto lg:mx-0">
              Add experiences, attach proof, get them verified by mentors and employers — then share a single professional link.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Link href="/auth/register" className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-primary-600 text-white font-medium hover:bg-primary-700">
                Get Started
              </Link>
              <Link href="/auth/login" className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-white border border-gray-200 text-primary-600 font-medium hover:bg-gray-50">
                Sign In
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                Verified credentials
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v4a4 4 0 004 4h10" /></svg>
                Rich media & docs
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 20l9-5-9-5-9 5 9 5z" /></svg>
                Public portfolio link
              </div>
            </div>
          </div>

          <div>
            <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400">Preview</div>
                    <div className="mt-2 font-medium text-gray-900">siddharth.dev/portfolio</div>
                  </div>
                  <div className="text-xs text-gray-400">Public</div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">S</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900">Frontend Intern — Acme</div>
                        <div className="text-xs text-green-600 font-medium">Verified</div>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">Built responsive UI, reduced load by 30%.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700">P</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900">Open Source — Portfolio Kit</div>
                        <div className="text-xs text-yellow-600 font-medium">Pending</div>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">Pulled 3 PRs, docs & CI setup.</div>
                    </div>
                  </div>

                  <div className="mt-4 text-right">
                    <Link href="/portfolio/demo" className="inline-flex items-center px-4 py-2 rounded-md text-sm bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100">
                      View public portfolio →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500">Shareable link • Verified badges</div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="mt-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Verified Experiences',
                desc: 'Get mentors & employers to vouch for real work.',
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" /></svg>
                )
              },
              {
                title: 'Upload Proof',
                desc: 'Attach docs, images, videos and certificates.',
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" /></svg>
                )
              },
              {
                title: 'Share & Get Hired',
                desc: 'Send one link — remove resume guesswork.',
                icon: (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A2 2 0 0122 9.618v4.764a2 2 0 01-2.447 1.894L15 14M10 14l-4.553 2.276A2 2 0 013 14.382V9.618a2 2 0 011.447-1.894L10 10" /></svg>
                )
              }
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary-50 text-primary-600">{f.icon}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{f.title}</h4>
                    <p className="mt-2 text-sm text-gray-500">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mt-16 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 text-center">How it works</h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { n: '1', title: 'Add entry', desc: 'Describe what you did, attach proof.' },
              { n: '2', title: 'Request verification', desc: 'Send to a mentor or employer.' },
              { n: '3', title: 'Share link', desc: 'One verified portfolio — universal link.' }
            ].map((s) => (
              <div key={s.n} className="flex flex-col items-center text-center p-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary-600 text-white font-semibold">{s.n}</div>
                <h3 className="mt-4 font-medium text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-12 text-center text-sm text-gray-400">© {new Date().getFullYear()} TruePortMe</footer>
      </main>
    </div>
  );
}
