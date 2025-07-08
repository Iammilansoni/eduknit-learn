
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, X, ChevronDown, Home, Layout, Users, BookOpen, MessageCircle, Megaphone, Brain, Bot, Database, FlaskConical, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import NavDropdownItem from '../navbar/NavDropdownItem';
import { useAuth } from '@/contexts/AuthContextUtils';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isLoggedIn = !!user;

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleRegister = () => {
    navigate('/register');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { 
      name: "Home", 
      path: "/", 
      dropdown: true,
      icon: Home,
      dropdownItems: [
        { 
          name: "Overview of EduKnit", 
          path: "/overview",
          icon: Layout,
          description: "Learn about our mission and vision"
        },
        { 
          name: "Key Features", 
          path: "/features",
          icon: Layout,
          description: "Discover what makes our platform unique"
        },
        { 
          name: "Testimonials & Success Stories", 
          path: "/testimonials",
          icon: Users,
          description: "Read about our students' experiences"
        },
        { 
          name: "Explore Programs", 
          path: "/programs",
          icon: BookOpen,
          description: "Browse our diverse range of courses"
        },
      ]
    },
    { name: "About Us", path: "/about", dropdown: false },
    { 
      name: "Programs", 
      path: "/programs", 
      dropdown: false,
      icon: BookOpen,
      dropdownItems: [
        { 
          name: "Communication Skills", 
          path: "/programs/communication-skills",
          icon: Users,
          description: "Master communication and presentation skills"
        },
        { 
          name: "Digital Marketing", 
          path: "/programs/digital-marketing",
          icon: Megaphone,
          description: "Learn digital marketing and growth strategies"
        },
        { 
          name: "Basics of AI", 
          path: "/programs/basics-of-ai",
          icon: Brain,
          description: "Understand AI fundamentals and applications"
        },
        { 
          name: "AI Prompt Crafting", 
          path: "/programs/ai-prompt-crafting",
          icon: Bot,
          description: "Master AI tools and prompt engineering"
        },
        { 
          name: "Data Analytics", 
          path: "/programs/data-analytics",
          icon: Database,
          description: "Learn data analysis and visualization"
        },
        { 
          name: "BioSkills", 
          path: "/programs/bioskills",
          icon: FlaskConical,
          description: "Develop practical biology skills"
        },
        { 
          name: "Decision-Making Skills", 
          path: "/programs/decision-making",
          icon: Lightbulb,
          description: "Master critical thinking and problem solving"
        }
      ]
    },
    { name: "Chat", path: "/chat", dropdown: false },
    { name: "Blog", path: "/blog", dropdown: false },
    { name: "Support", path: "/support", dropdown: false },
  ];

  return (
    <nav className="bg-gray-200 dark:bg-gray-900 sticky top-0 z-50 shadow-sm">
 

  <div className="max-w-7xl mx-auto px-6 lg:px-8">
    {/* Increased height to h-28 (7rem/112px) */}
    <div className="flex items-center justify-between h-28">
      <Link to="/" className="flex items-center">
        <img 
          src="/uploads/logo.png" 
          alt="EduKnit Logo" 
          className="h-16 w-auto"  // Increased logo size
        />
      </Link>


          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <div key={item.name} className="relative group">
                <Link 
                  to={item.path} 
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-eduBlue-500 dark:hover:text-eduBlue-400 transition-colors duration-200 flex items-center"
                >
                  {item.name}
                  {item.dropdown && <ChevronDown className="ml-1 h-4 w-4" />}
                </Link>
                {item.dropdown && (
                  <div className="absolute left-0 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border dark:border-gray-700">
                    {item.name === "Home" ? (
                      <div className="grid grid-cols-1 gap-1 p-2 w-72">
                        {item.dropdownItems && item.dropdownItems.map((dropdownItem, index) => (
                          <NavDropdownItem
                            key={index}
                            icon={dropdownItem.icon}
                            title={dropdownItem.name}
                            description={dropdownItem.description}
                            path={dropdownItem.path}
                            onClick={toggleMenu}
                          />
                        ))}
                      </div>
                    ) : item.name === "Programs" ? (
                      <div className="w-72 p-2">
                        {item.dropdownItems && item.dropdownItems.map((program, index) => (
                          <NavDropdownItem
                            key={index}
                            icon={program.icon}
                            title={program.name}
                            description={program.description}
                            path={program.path}
                            onClick={toggleMenu}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-1 p-2">
                        {item.dropdownItems && item.dropdownItems.map((dropdownItem, index) => (
                          <NavDropdownItem
                            key={index}
                            icon={dropdownItem.icon}
                            title={dropdownItem.name}
                            description={dropdownItem.description}
                            path={dropdownItem.path}
                            onClick={toggleMenu}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            <a 
              href="https://discord.gg/your-invite-link" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-eduBlue-500 dark:hover:text-eduBlue-400 transition-colors duration-200 flex items-center gap-2"
              aria-label="Join our Community"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="hidden lg:inline">Community</span>
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to={user?.role === 'admin' ? '/admin/dashboard' : '/student-dashboard'} 
                  className="text-gray-700 dark:text-gray-200 hover:text-eduBlue-500 dark:hover:text-eduBlue-400"
                >
                  Dashboard
                </Link>
                <div className="relative group">
                  <Avatar className="cursor-pointer h-8 w-8">
                    <AvatarImage src={user?.profilePicture || "/placeholder.svg"} />
                    <AvatarFallback className="bg-eduBlue-100 text-eduBlue-800">
                      {user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border dark:border-gray-700">
                    <Link to="/student/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Profile</Link>
                    <Link to="/student/analytics" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Analytics</Link>
                    <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Settings</Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Logout</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={() => navigate('/login')} className="text-eduBlue-500 border-eduBlue-500 hover:bg-eduBlue-50">Login</Button>
                <Button onClick={handleRegister} className="bg-eduOrange-500 hover:bg-eduOrange-600 text-white">Register</Button>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 dark:text-gray-200 hover:text-eduBlue-500 dark:hover:text-eduBlue-400 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            
          </div>
        </div>
      </div>

      <div className={cn("md:hidden", isOpen ? "block" : "hidden")}>
        <div className="bg-white dark:bg-gray-900 shadow-lg pt-2 pb-4 animate-fade-in">
          {navItems.map((item) => (
            <div key={item.name}>
              {item.dropdown && item.dropdownItems ? (
                <>
                  <div className="block px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200">
                    {item.name}
                  </div>
                  <div className="pl-6">
                    {item.dropdownItems.map((dropdownItem, index) => (
                      <Link
                        key={index}
                        to={dropdownItem.path}
                        className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={toggleMenu}
                      >
                        <div className="flex items-center space-x-2">
                          {dropdownItem.icon && <dropdownItem.icon className="h-4 w-4 text-eduBlue-500" />}
                          <span>{dropdownItem.name}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  to={item.path}
                  className="block px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={toggleMenu}
                >
                  {item.name}
                </Link>
              )}
            </div>
          ))}
          
          <a
            href="https://discord.gg/your-invite-link"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={toggleMenu}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Community
          </a>
          
          <div className="mt-4 px-4 py-2 border-t border-gray-200 dark:border-gray-700">
            {isLoggedIn ? (
              <div className="space-y-2">
                <Link 
                  to={user?.role === 'admin' ? '/admin/dashboard' : '/student-dashboard'} 
                  className="block py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-eduBlue-500 dark:hover:text-eduBlue-400"
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/student/profile" 
                  className="block py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-eduBlue-500 dark:hover:text-eduBlue-400"
                  onClick={toggleMenu}
                >
                  Profile
                </Link>
                <Link 
                  to="/student/analytics" 
                  className="block py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-eduBlue-500 dark:hover:text-eduBlue-400"
                  onClick={toggleMenu}
                >
                  Analytics
                </Link>
                <button 
                  onClick={() => {handleLogout(); toggleMenu();}}
                  className="block py-2 text-base font-medium text-red-500 hover:text-red-600 w-full text-left"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-center text-eduBlue-500 border-eduBlue-500 hover:bg-eduBlue-50" 
                  onClick={() => {navigate('/login'); toggleMenu();}}
                >
                  Login
                </Button>
                <Button 
                  className="w-full justify-center bg-eduOrange-500 hover:bg-eduOrange-600 text-white"
                  onClick={() => {navigate('/register'); toggleMenu();}}
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
     
<div className="bg-gradient-to-r from-eduOrange-500 to-eduOrange-600 text-white text-center py-3 px-4 text-sm font-bold animate-pulse mb-8">
  🔥 Enroll Now - Special Discount for First 100 Students! 🔥
</div>
    </nav>
  );
};

export default Navbar;
