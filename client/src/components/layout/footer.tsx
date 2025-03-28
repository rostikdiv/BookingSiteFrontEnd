import { Link } from "wouter";
import { Hotel } from "lucide-react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Hotel className="h-6 w-6 mr-2" />
              <span className="font-poppins font-semibold text-xl">StayEase</span>
            </div>
            <p className="text-neutral-400 mb-4">Find your perfect stay anywhere in the world.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-200">
                <FaFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-200">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-200">
                <FaInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-200">
                <FaLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-neutral-400 hover:text-white transition-colors duration-200">About</Link></li>
              <li><Link href="/careers" className="text-neutral-400 hover:text-white transition-colors duration-200">Careers</Link></li>
              <li><Link href="/press" className="text-neutral-400 hover:text-white transition-colors duration-200">Press</Link></li>
              <li><Link href="/blog" className="text-neutral-400 hover:text-white transition-colors duration-200">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-neutral-400 hover:text-white transition-colors duration-200">Help Center</Link></li>
              <li><Link href="/safety" className="text-neutral-400 hover:text-white transition-colors duration-200">Safety Information</Link></li>
              <li><Link href="/cancellation" className="text-neutral-400 hover:text-white transition-colors duration-200">Cancellation Options</Link></li>
              <li><Link href="/contact" className="text-neutral-400 hover:text-white transition-colors duration-200">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/terms" className="text-neutral-400 hover:text-white transition-colors duration-200">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-neutral-400 hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="text-neutral-400 hover:text-white transition-colors duration-200">Cookie Policy</Link></li>
              <li><Link href="/trust" className="text-neutral-400 hover:text-white transition-colors duration-200">Trust & Safety</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-neutral-800 text-center text-neutral-400">
          <p>&copy; {currentYear} StayEase. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
