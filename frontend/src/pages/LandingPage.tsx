import { Link } from "react-router-dom";

const LandingPage = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden">
      {/* Background Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute top-1/2 left-0 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 dark:border-slate-800 backdrop-blur-xl bg-white/80 dark:bg-slate-950/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 font-bold text-white">
              N
            </div>
            <div>
              <h1 className="text-lg font-bold">NexusHire</h1>
              <p className="text-xs text-slate-500">AI Job Tracker</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              Get Started
            </Link>

            {user.role === "admin" && (
              <Link
                to="/admin"
                className="hidden md:block rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              ✨ AI Powered Career Assistant
            </div>

            <h1 className="mt-7 text-5xl font-extrabold leading-tight lg:text-6xl">
              Organize every
              <span className="block text-blue-600">
                job application.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              Track applications, compare resumes with AI, manage interviews,
              receive reminders, and visualize your job search from one premium
              dashboard.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/signup"
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition"
              >
                Start for Free
              </Link>

              <Link
                to="/login"
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-6 py-3 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Sign In
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                ["AI", "Resume Match"],
                ["24/7", "Reminders"],
                ["100%", "Free"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 backdrop-blur"
                >
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Mockup */}
          <div className="relative">
            <div className="absolute -inset-5 rounded-[36px] bg-gradient-to-r from-blue-500/20 to-violet-500/20 blur-2xl" />

            <div className="relative rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
              {/* Window */}
              <div className="mb-5 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-bold">My Applications</h3>
                  <p className="text-sm text-slate-500">
                    12 active positions
                  </p>
                </div>

                <div className="rounded-xl bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-sm font-semibold text-blue-700 dark:text-blue-300">
                  +3 this week
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    company: "Google",
                    role: "Software Engineer",
                    status: "Interviewed",
                    color: "amber",
                  },
                  {
                    company: "Microsoft",
                    role: "AI Engineer",
                    status: "Applied",
                    color: "blue",
                  },
                  {
                    company: "Amazon",
                    role: "Backend Developer",
                    status: "Offer",
                    color: "green",
                  },
                ].map((job) => (
                  <div
                    key={job.company}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-4"
                  >
                    <div>
                      <h4 className="font-semibold">{job.company}</h4>
                      <p className="text-sm text-slate-500">{job.role}</p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        job.color === "amber"
                          ? "bg-amber-100 text-amber-700"
                          : job.color === "green"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* AI Card */}
              <div className="mt-6 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">AI Resume Match</p>
                    <h2 className="mt-1 text-4xl font-bold">92%</h2>
                  </div>

                  <div className="rounded-xl bg-white/20 px-3 py-2 text-sm">
                    Strong Match
                  </div>
                </div>

                <div className="mt-4 h-2 rounded-full bg-white/20">
                  <div className="h-2 w-[92%] rounded-full bg-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-14 text-center">
            <span className="font-semibold uppercase tracking-widest text-blue-600 text-sm">
              Features
            </span>

            <h2 className="mt-4 text-4xl font-bold">
              Built for modern job seekers
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-500 dark:text-slate-400">
              Everything you need to manage applications, prepare interviews,
              and improve your resume with AI insights.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: "📌",
                title: "Track Jobs",
                desc: "Manage every application with statuses and notes.",
              },
              {
                icon: "🤖",
                title: "AI Resume Match",
                desc: "Compare resumes against job descriptions instantly.",
              },
              {
                icon: "📅",
                title: "Smart Reminders",
                desc: "Never miss interviews or follow-ups again.",
              },
              {
                icon: "📊",
                title: "Analytics",
                desc: "Visualize trends and improve your success rate.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-7 transition hover:-translate-y-1 hover:border-blue-300"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-2xl">
                  {item.icon}
                </div>

                <h3 className="mb-3 text-lg font-bold">{item.title}</h3>

                <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-10 lg:p-16 text-center text-white">
            <h2 className="text-3xl lg:text-5xl font-bold">
              Ready to land your dream job?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-blue-100">
              Join thousands of students and professionals using NexusHire to
              organize their entire job search.
            </p>

            <Link
              to="/signup"
              className="mt-8 inline-flex rounded-xl bg-white px-8 py-4 font-semibold text-blue-700 hover:bg-slate-100 transition"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row lg:px-8">
          <div>
            <h3 className="text-lg font-bold">NexusHire</h3>
            <p className="text-sm text-slate-500">
              AI Powered Job Application Tracker
            </p>
          </div>

          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} NexusHire. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;