import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, ShieldCheck, MapPin, ArrowRight, Users, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-50 to-white -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6">
                Together We Can <span className="text-emerald-600">End Hunger</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Connect surplus food from donors directly to nearby volunteers who deliver it to local families and organizations in need.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!user ? (
                  <>
                    <Link
                      to="/register"
                      className="px-8 py-4 bg-emerald-600 text-white rounded-full font-bold text-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                    >
                      Join as a Donor <ArrowRight className="h-5 w-5" />
                    </Link>
                    <Link
                      to="/register"
                      className="px-8 py-4 bg-white text-emerald-600 border-2 border-emerald-600 rounded-full font-bold text-lg hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                    >
                      Become a Volunteer
                    </Link>
                  </>
                ) : (
                  <Link
                    to={user.role === 'admin' ? '/admin-dashboard' : user.role === 'donor' ? '/donor-dashboard' : '/volunteer-dashboard'}
                    className="px-8 py-4 bg-emerald-600 text-white rounded-full font-bold text-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                  >
                    Go to Dashboard <ArrowRight className="h-5 w-5" />
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats/Social Proof */}
      <section className="py-12 bg-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-sm uppercase tracking-widest font-bold">
            <div>
              <div className="text-3xl mb-1">10k+</div>
              <div className="text-emerald-300">Meals Shared</div>
            </div>
            <div>
              <div className="text-3xl mb-1">500+</div>
              <div className="text-emerald-300">Donors</div>
            </div>
            <div>
              <div className="text-3xl mb-1">1.2k+</div>
              <div className="text-emerald-300">Volunteers</div>
            </div>
            <div>
              <div className="text-3xl mb-1">20+</div>
              <div className="text-emerald-300">Cities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our simple platform makes it easy to donate surplus food or lend a hand in your local community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              {
                icon: <Heart className="h-10 w-10 text-rose-500 mx-auto mb-4" />,
                title: "Post Food",
                desc: "Donors list surplus food items, specifying quantity and pickup location."
              },
              {
                icon: <Users className="h-10 w-10 text-emerald-600 mx-auto mb-4" />,
                title: "Volunteer Accepts",
                desc: "Volunteers in the area browse requests and choose what they can deliver."
              },
              {
                icon: <MapPin className="h-10 w-10 text-blue-500 mx-auto mb-4" />,
                title: "Real-time Tracking",
                desc: "Smooth coordination between donor and volunteer until the food reaches its destination."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-all"
              >
                {feature.icon}
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-emerald-50 rounded-[3rem] p-12 overflow-hidden relative">
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Reduce Waste, Feed Hope</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Trash2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Combat Food Waste</h4>
                      <p className="text-gray-600">Billions of pounds of food are wasted annually while people go hungry. We tackle this imbalance.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <ShieldCheck className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">Safe and Secure</h4>
                      <p className="text-gray-600">All users are verified, and we follow strict guidelines to ensure food safety in every delivery.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=1000"
                  alt="Food Donation"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
