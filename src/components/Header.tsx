'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export type NavLink = { label: string; href: string; external?: boolean }

export interface HeaderProps {
  siteTitle?: string
  logo?: React.ReactNode // pass <Image /> or SVG if you want
  links?: NavLink[]
  className?: string
}

const DEFAULT_LINKS: NavLink[] = [
  { label: 'Kontakta oss', href: '/contact' },
  { label: 'Såhär fungerar Vibbla', href: '/about' },
  { label: 'Hjälpcenter', href: '/help' },
]

export function Header({
  siteTitle = 'Vibbla',
  logo = <Image src="/Vibbla_logo_white.svg" width={80}
                      height={28}
                      alt="logo"/>,
  links = DEFAULT_LINKS,
  className = '',
}: HeaderProps) {
  const [open, setOpen] = useState(false)

  return (
    <header className={`bg-(--dark-grey) shadow-md ${className}`}>
      <div className="flex items-center justify-between px-10 py-8">
        {/* Left: Logo or site title */}
        <Link href="/" className="flex items-center">
          {logo ? (
            <span className="h-8 w-auto">{logo}</span>
          ) : (
            <span className="text-lg font-bold">{siteTitle}</span>
          )}
        </Link>

        {/* Right: Hamburger / Close button */}
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="focus:outline-none"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? (
            // Cross (X)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            // Hamburger (3 lines)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Expanding menu */}
      {open && (
        <nav className="flex justify-center bg-(--dark-grey) border-b">
          <ul className="flex-col flex text-center gap-4 py-8">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  {...(l.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className="text-sm font-medium hover:underline"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
