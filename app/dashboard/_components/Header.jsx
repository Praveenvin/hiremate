"use client";

import { Button } from "@/components/ui/button";
import { UserButton } from "@/lib/simpleAuth";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { CgMenu, CgClose } from "react-icons/cg";

const Header = () => {
  const [menuIcon, setMenuIcon] = useState(false);
  const path = usePathname();
  const router = useRouter();

  const isHidden = path === "/dashboard/success";

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Favourites", href: "/dashboard/favourites" },
    { label: "Analytics", href: "/dashboard/analytics" },
    { label: "Code Editor", href: "/code-editor" },
    // Upgrade removed based on your setting
  ];

  return (
    <div
      className={`flex p-4 items-center bg-secondary justify-between shadow-sm relative z-20 ${
        isHidden ? "hidden" : ""
      }`}
    >
      {/* Logo */}
      <Image
        src="/logo2.png"
        width={160}
        height={100}
        alt="logo"
        onClick={() => router.replace("/")}
        className="cursor-pointer object-contain"
      />

      {/* Desktop Menu */}
      <ul className="hidden md:flex gap-6">
        {navItems.map((item) => (
          <li
            key={item.href}
            onClick={() => router.replace(item.href)}
            className={`font-medium hover:text-primary hover:font-extrabold transition-all cursor-pointer ${
              path === item.href ? "text-primary font-extrabold" : ""
            }`}
          >
            {item.label}
          </li>
        ))}
      </ul>

      {/* Right Section → User + Mobile Menu Button */}
      <div className="flex items-center gap-3">
        <UserButton />

        {/* Mobile Hamburger */}
        <div className="md:hidden flex justify-end">
          <Button
            variant="secondary"
            onClick={() => setMenuIcon((prev) => !prev)}
          >
            {menuIcon ? (
              <CgClose className="text-2xl" />
            ) : (
              <CgMenu className="text-2xl" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      <div
        className={`absolute top-16 left-0 w-[70%] bg-secondary md:hidden transition-transform duration-300 rounded-lg shadow-lg ${
          menuIcon ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ul className="flex flex-col items-center gap-6 py-6">
          {navItems.map((item) => (
            <li
              key={item.href}
              onClick={() => {
                router.replace(item.href);
                setMenuIcon(false);
              }}
              className={`font-medium hover:text-primary hover:font-extrabold transition-all cursor-pointer ${
                path === item.href ? "text-primary font-extrabold" : ""
              }`}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Header;
