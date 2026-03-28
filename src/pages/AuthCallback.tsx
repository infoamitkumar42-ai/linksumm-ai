import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Auth error:', error)
        navigate('/login?error=auth_failed', { replace: true })
        return
      }

      if (data.session) {
        navigate('/', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-center">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent 
                        rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-medium">Signing you in...</p>
        <p className="text-sm text-gray-400 mt-2">Please wait...</p>
      </div>
    </div>
  )
}
