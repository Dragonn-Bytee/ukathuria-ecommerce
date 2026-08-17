import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useGoogleLogin } from '@react-oauth/google'
import { login, googleLogin } from '../store/slices/authSlice'
import toast from 'react-hot-toast'

// Google logo as SVG component
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
)

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading } = useSelector(state => state.auth)

  const submitHandler = async (e) => {
    e.preventDefault()
    try {
      await dispatch(login({ email, password })).unwrap()
      navigate('/')
      toast.success('Logged in successfully!')
    } catch (err) {
      toast.error(err || 'Failed to login')
    }
  }

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Fetch user info from Google with the access token
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        })
        const userInfo = await userInfoRes.json()
        await dispatch(googleLogin({
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          googleId: userInfo.sub
        })).unwrap()
        navigate('/')
        toast.success(`Welcome back, ${userInfo.name}! 👋`)
      } catch (err) {
        toast.error(err || 'Google login failed')
      }
    },
    onError: () => {
      toast.error('Google sign-in was cancelled or failed')
    }
  })

  return (
    <div className="flex justify-center items-center min-h-[80vh] py-12 animate-in fade-in zoom-in duration-300">
      <div className="glass w-full max-w-md p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-500 mt-1 text-sm">Sign in to continue shopping</p>
        </div>

        {/* Google Sign In Button */}
        <button
          onClick={() => handleGoogleLogin()}
          type="button"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-slate-200 rounded-xl bg-white hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-200 font-semibold text-slate-700 mb-6 disabled:opacity-60"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <form onSubmit={submitHandler} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white/80"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white/80"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 text-white font-semibold py-3 rounded-xl hover:bg-primary-700 active:scale-[0.98] transition-all shadow-lg shadow-primary-600/30 disabled:opacity-70"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Signing In...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-slate-600 text-sm">
          New Customer?{' '}
          <Link to="/register" className="text-primary-600 font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
