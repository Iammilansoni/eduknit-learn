
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="edu-container">
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and brief description */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-bold text-eduBlue-400">Edu<span className="text-eduOrange-400">Knit</span></span>
            </Link>
            <p className="text-gray-400 mb-4">
              Empowering learners worldwide with cutting-edge educational resources and a supportive community.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-eduBlue-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-eduBlue-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-eduBlue-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-eduBlue-400 transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-eduBlue-400 transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-eduBlue-400 transition-colors">About Us</Link></li>
              <li><Link to="/programs" className="text-gray-400 hover:text-eduBlue-400 transition-colors">Programs</Link></li>
              <li><Link to="/community" className="text-gray-400 hover:text-eduBlue-400 transition-colors">Community</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-eduBlue-400 transition-colors">Blog</Link></li>
              <li><Link to="/support" className="text-gray-400 hover:text-eduBlue-400 transition-colors">Support</Link></li>
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Programs</h3>
            <ul className="space-y-2">
              <li><Link to="/programs/technology" className="text-gray-400 hover:text-eduBlue-400 transition-colors">Technology</Link></li>
              <li><Link to="/programs/business" className="text-gray-400 hover:text-eduBlue-400 transition-colors">Business & Marketing</Link></li>
              <li><Link to="/programs/communication" className="text-gray-400 hover:text-eduBlue-400 transition-colors">Communication Skills</Link></li>
              <li><Link to="/programs/upcoming" className="text-gray-400 hover:text-eduBlue-400 transition-colors">Upcoming Courses</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-eduBlue-400 mr-2 mt-0.5" />
                <a href="mailto:deepak@eduknit.in" className="text-gray-400 hover:text-eduBlue-400 transition-colors">deepak@eduknit.in</a>
              </div>
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-eduBlue-400 mr-2 mt-0.5" />
                <a href="tel:9782225696" className="text-gray-400 hover:text-eduBlue-400 transition-colors">+91 9782225696</a>
              </div>
              <p className="text-gray-400">
                Office Hours: Monday - Friday, 9:00 AM - 5:00 PM IST
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} EduKnit. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/privacy-policy" className="text-gray-400 text-sm hover:text-eduBlue-400 transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="text-gray-400 text-sm hover:text-eduBlue-400 transition-colors">Terms of Service</Link>
              <Link to="/cookie-policy" className="text-gray-400 text-sm hover:text-eduBlue-400 transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
