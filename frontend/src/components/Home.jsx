import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Target, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main>
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Your Personal Learning Journey
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Create customized learning roadmaps, track your progress, and achieve your goals with LearnWise.
            </p>
            <Link
              to={isAuthenticated ? "/create" : "/auth"}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isAuthenticated ? "Create Roadmap" : "Get Started"}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Choose LearnWise?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-lg bg-blue-50">
                <BookOpen className="h-10 w-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Custom Roadmaps</h3>
                <p className="text-gray-600">
                  Create personalized learning paths tailored to your goals and current knowledge level.
                </p>
              </div>
              <div className="p-6 rounded-lg bg-blue-50">
                <Target className="h-10 w-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
                <p className="text-gray-600">
                  Monitor your learning journey with visual progress indicators and milestone tracking.
                </p>
              </div>
              <div className="p-6 rounded-lg bg-blue-50">
                <Clock className="h-10 w-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Flexible Timeline</h3>
                <p className="text-gray-600">
                  Learn at your own pace with customizable timeframes for each skill path.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to Start Your Learning Journey?
            </h2>
            <Link
              to={isAuthenticated ? "/create" : "/auth"}
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg"
            >
              {isAuthenticated ? "Create Your First Roadmap" : "Sign Up Now"}
              <ArrowRight className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}