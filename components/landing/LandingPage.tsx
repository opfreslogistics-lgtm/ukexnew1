'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { 
  Lock, Shield, Key, Sparkles, Zap, Globe, 
  Check, ArrowRight, Users, FileLock, Mail,
  Moon, Sun, Star, TrendingUp, Award, Heart,
  Github, Twitter, Linkedin, Facebook
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Load dark mode preference
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) {
      setDarkMode(saved === 'true')
    } else {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', darkMode.toString())
  }, [darkMode])

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50'
    } relative overflow-hidden`}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob ${
          darkMode ? 'bg-purple-500' : 'bg-purple-300'
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000 ${
          darkMode ? 'bg-blue-500' : 'bg-blue-300'
        }`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000 ${
          darkMode ? 'bg-pink-500' : 'bg-pink-300'
        }`}></div>
      </div>

      {/* Header */}
      <header className="relative z-50 px-6 py-4 backdrop-blur-md bg-white/5 dark:bg-black/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                <Lock className="text-white" size={24} />
              </div>
            </div>
            <span className={`text-2xl font-bold transition-colors ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>UKEX Vault</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-lg transition-all duration-300 ${
                darkMode 
                  ? 'hover:bg-white/10 text-purple-300' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link href="/auth/login">
              <Button variant="ghost" className={`${
                darkMode ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
              }`}>
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Particles Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Particles darkMode={darkMode} />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-32 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20 mb-4">
            <Sparkles className="text-purple-400" size={16} />
            <span className={`text-sm font-medium ${
              darkMode ? 'text-purple-300' : 'text-purple-700'
            }`}>Zero-Knowledge Encryption</span>
          </div>
          <h1 className={`text-5xl md:text-7xl lg:text-8xl font-bold leading-tight transition-colors ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Your Secrets,
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
              Perfectly Protected
            </span>
          </h1>
          <p className={`text-xl md:text-2xl max-w-2xl mx-auto transition-colors ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Zero-knowledge password and secrets manager with elegant design, 
            powerful features, and military-grade encryption.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Link href="/auth/signup">
              <Button size="lg" className="text-base px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
                <span>Start Free Trial</span>
                <ArrowRight size={18} className="flex-shrink-0" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost" size="lg" className={`text-base px-8 py-4 border-2 transition-all duration-300 hover:scale-105 flex items-center justify-center ${
                darkMode 
                  ? 'text-white border-white/20 hover:bg-white/10' 
                  : 'text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}>
                <span>Sign In</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 transition-colors ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Everything You Need
          </h2>
          <p className={`text-xl transition-colors ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Powerful features to keep your digital life secure
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Shield size={32} />}
            title="Zero-Knowledge Encryption"
            description="Your data is encrypted before it leaves your device. We can't see your secrets, even if we wanted to."
            darkMode={darkMode}
          />
          <FeatureCard
            icon={<Key size={32} />}
            title="Password Generator"
            description="Create strong, unique passwords with customizable length and character sets."
            darkMode={darkMode}
          />
          <FeatureCard
            icon={<Sparkles size={32} />}
            title="Collection Links"
            description="Request information from others securely with customizable collection links."
            darkMode={darkMode}
          />
          <FeatureCard
            icon={<Users size={32} />}
            title="Secure Sharing"
            description="Share items with granular permissions - view, reveal, edit, or transfer ownership."
            darkMode={darkMode}
          />
          <FeatureCard
            icon={<Mail size={32} />}
            title="Email Aliases"
            description="Protect your real email with disposable aliases that you can rotate or retire anytime."
            darkMode={darkMode}
          />
          <FeatureCard
            icon={<Zap size={32} />}
            title="Lightning Fast"
            description="Optimized for speed with instant saves, optimistic updates, and smooth animations."
            darkMode={darkMode}
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 transition-colors ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Trusted by Thousands
          </h2>
          <p className={`text-xl transition-colors ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            See what our users are saying
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TestimonialCard
            name="Sarah Johnson"
            role="Software Engineer"
            content="UKEX Vault has completely transformed how I manage my passwords. The zero-knowledge encryption gives me peace of mind."
            rating={5}
            darkMode={darkMode}
          />
          <TestimonialCard
            name="Michael Chen"
            role="Business Owner"
            content="The collection links feature is a game-changer. I can securely request information from my team without compromising security."
            rating={5}
            darkMode={darkMode}
          />
          <TestimonialCard
            name="Emily Rodriguez"
            role="Freelancer"
            content="Beautiful design, powerful features, and it just works. This is the password manager I've been waiting for."
            rating={5}
            darkMode={darkMode}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
        <div className={`backdrop-blur-xl rounded-3xl p-12 border-2 transition-all duration-500 ${
          darkMode 
            ? 'bg-white/10 border-white/20' 
            : 'bg-white/80 border-gray-200 shadow-2xl'
        }`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mb-6">
            <Award className="text-white" size={20} />
            <span className="text-sm font-bold text-white">Join Thousands of Users</span>
          </div>
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 transition-colors ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Ready to Secure Your Digital Life?
          </h2>
          <p className={`text-xl mb-8 transition-colors ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Join thousands of users who trust UKEX Vault with their most sensitive information.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="text-base px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              Get Started Free
              <ArrowRight className="ml-2" size={18} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={`relative z-10 border-t transition-colors ${
        darkMode ? 'border-white/10' : 'border-gray-200'
      } py-12`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Lock className="text-white" size={24} />
                </div>
                <span className={`text-xl font-bold transition-colors ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>UKEX Vault</span>
              </div>
              <p className={`text-sm transition-colors ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Your secrets, perfectly protected.
              </p>
            </div>
            <div>
              <h3 className={`font-bold mb-4 transition-colors ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>Product</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className={`text-sm transition-colors hover:underline ${
                  darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}>Features</Link></li>
                <li><Link href="/pricing" className={`text-sm transition-colors hover:underline ${
                  darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}>Pricing</Link></li>
                <li><Link href="/security" className={`text-sm transition-colors hover:underline ${
                  darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}>Security</Link></li>
              </ul>
            </div>
            <div>
              <h3 className={`font-bold mb-4 transition-colors ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className={`text-sm transition-colors hover:underline ${
                  darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}>About</Link></li>
                <li><Link href="/blog" className={`text-sm transition-colors hover:underline ${
                  darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}>Blog</Link></li>
                <li><Link href="/contact" className={`text-sm transition-colors hover:underline ${
                  darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}>Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className={`font-bold mb-4 transition-colors ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>Connect</h3>
              <div className="flex gap-4">
                <a href="#" className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  darkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}>
                  <Twitter size={20} />
                </a>
                <a href="#" className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  darkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}>
                  <Github size={20} />
                </a>
                <a href="#" className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  darkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}>
                  <Linkedin size={20} />
                </a>
                <a href="#" className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  darkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}>
                  <Facebook size={20} />
                </a>
              </div>
            </div>
          </div>
          <div className={`border-t pt-8 text-center transition-colors ${
            darkMode ? 'border-white/10 text-gray-400' : 'border-gray-200 text-gray-600'
          }`}>
            <p>&copy; 2024 UKEX Vault. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

function FeatureCard({ icon, title, description, darkMode }: { 
  icon: React.ReactNode, 
  title: string, 
  description: string,
  darkMode: boolean 
}) {
  return (
    <div className={`backdrop-blur-xl rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
      darkMode 
        ? 'bg-white/10 border-white/20 hover:bg-white/15' 
        : 'bg-white/80 border-gray-200 hover:bg-white shadow-lg'
    }`}>
      <div className="text-purple-400 mb-4">{icon}</div>
      <h3 className={`text-xl font-bold mb-2 transition-colors ${
        darkMode ? 'text-white' : 'text-gray-900'
      }`}>{title}</h3>
      <p className={`transition-colors ${
        darkMode ? 'text-gray-300' : 'text-gray-600'
      }`}>{description}</p>
    </div>
  )
}

function Particles({ darkMode }: { darkMode: boolean }) {
  const particles = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
    moveX: (Math.random() - 0.5) * 100,
    moveY: (Math.random() - 0.5) * 100,
  }))

  return (
    <>
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute rounded-full ${
              darkMode ? 'bg-purple-400/30' : 'bg-purple-300/40'
            }`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animation: `float-${particle.id} ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>
      <style jsx>{`
        ${particles.map((particle) => `
          @keyframes float-${particle.id} {
            0%, 100% {
              transform: translate(0, 0) scale(1);
              opacity: 0.3;
            }
            50% {
              transform: translate(${particle.moveX}px, ${particle.moveY}px) scale(1.5);
              opacity: 0.8;
            }
          }
        `).join('')}
      `}</style>
    </>
  )
}

function TestimonialCard({ name, role, content, rating, darkMode }: {
  name: string
  role: string
  content: string
  rating: number
  darkMode: boolean
}) {
  return (
    <div className={`backdrop-blur-xl rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
      darkMode 
        ? 'bg-white/10 border-white/20 hover:bg-white/15' 
        : 'bg-white/80 border-gray-200 hover:bg-white shadow-lg'
    }`}>
      <div className="flex gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="text-yellow-400 fill-yellow-400" size={18} />
        ))}
      </div>
      <p className={`mb-4 transition-colors ${
        darkMode ? 'text-gray-300' : 'text-gray-600'
      }`}>"{content}"</p>
      <div>
        <p className={`font-bold transition-colors ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>{name}</p>
        <p className={`text-sm transition-colors ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>{role}</p>
      </div>
    </div>
  )
}