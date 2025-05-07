import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Hotel, Menu, X } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (user: any) => {
    if (!user || (!user.firstName && !user.lastName)) {
      return "К";
    }

    const firstName = user.firstName || "";
    const lastName = user.lastName || "";

    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const navigationLinks = [
    { title: "Головна", path: "/" },
    { title: "Огляд", path: "/properties" }
  ];

  return (
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center">
                  <Hotel className="h-6 w-6 text-primary mr-2" />
                  <span className="font-poppins font-semibold text-xl text-primary">StayEase</span>
                </Link>
              </div>
              <nav className="hidden md:ml-10 md:flex space-x-8">
                {navigationLinks.map((link) => (
                    <Link
                        key={link.path}
                        href={link.path}
                        className={`${
                            location === link.path ? "text-primary" : "text-muted-foreground"
                        } hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200`}
                    >
                      {link.title}
                    </Link>
                ))}
              </nav>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <div className="px-2 py-1.5 text-sm font-medium">
                        {user.firstName} {user.lastName}
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link href="/profile" className="w-full">
                          <Button variant="ghost" className="w-full justify-start">Мій профіль</Button>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/add-house" className="w-full">
                          <Button variant="ghost" className="w-full justify-start">Додати помешкання</Button>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        Вийти
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              ) : (
                  <>
                    <Button variant="outline" asChild>
                      <Link href="/auth">Увійти</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/auth?tab=register">Зареєструватися</Link>
                    </Button>
                  </>
              )}
            </div>
            <div className="flex md:hidden">
              <button
                  type="button"
                  className="text-muted-foreground hover:text-primary"
                  onClick={toggleMenu}
                  aria-label={isMenuOpen ? "Закрити меню" : "Відкрити меню"}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        <div className={`${isMenuOpen ? "block" : "hidden"} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationLinks.map((link) => (
                <Link
                    key={link.path}
                    href={link.path}
                    className={`${
                        location === link.path ? "text-primary" : "text-muted-foreground"
                    } block px-3 py-2 rounded-md text-base font-medium`}
                    onClick={() => setIsMenuOpen(false)}
                >
                  {link.title}
                </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-border">
            <div className="flex items-center px-5">
              {user ? (
                  <div className="space-y-2 w-full">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-base font-medium text-foreground">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm font-medium text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">Мій профіль</Button>
                      </Link>
                      <Link href="/add-house" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">Додати помешкання</Button>
                      </Link>
                      <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                      >
                        Вийти
                      </Button>
                    </div>
                  </div>
              ) : (
                  <div className="w-full space-y-2">
                    <Button
                        variant="outline"
                        className="w-full"
                        asChild
                        onClick={() => setIsMenuOpen(false)}
                    >
                      <Link href="/auth">Увійти</Link>
                    </Button>
                    <Button
                        className="w-full"
                        asChild
                        onClick={() => setIsMenuOpen(false)}
                    >
                      <Link href="/auth?tab=register">Зареєструватися</Link>
                    </Button>
                  </div>
              )}
            </div>
          </div>
        </div>
      </header>
  );
}