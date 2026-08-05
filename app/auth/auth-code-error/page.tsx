import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 py-20 mx-auto text-center">
      <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-100 shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Authentication Error</h1>
      <p className="text-slate-600 mt-2 mb-8 font-medium">
        Something went wrong during the sign-in process. Please try again.
      </p>
      <Link 
        href="/login"
        className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
      >
        Back to Login
      </Link>
    </div>
  )
}
