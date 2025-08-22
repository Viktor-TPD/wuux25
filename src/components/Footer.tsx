'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export type NavLink = { label: string; href: string; external?: boolean }

export interface FooterProps {
  siteTitle?: string
  logo?: React.ReactNode
  links?: NavLink[]
  className?: string
}

const FOOTER_LINKS: NavLink[] = [
  { label: 'Kontakta oss', href: '/contact' },
  { label: 'Såhär fungerar Vibbla', href: '/about' },
]

export function Footer({
  siteTitle = 'Vibbla',
  logo = <Image src="/Vibbla_logo_white.svg" width={80}
                    height={28}
                    alt="logo"/>,
  links = FOOTER_LINKS,
  className = '',
}: FooterProps) {
  const [open, setOpen] = useState(false)

  return (
    <footer className={`bg-(--dark-grey) flex flex-row justify-between shadow-md ${className}`}>
        <div className='footer-info justify-between flex flex-col gap-16 px-8 py-8'>
            <ul className='flex-col flex gap-2'>
                    {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  {...(l.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className="text-sm font-medium font-inter hover:underline"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
                
            </ul>
            <div>
                <Link href="/" className="flex items-center">
                  {logo ? (
                    <span className="h-8 w-auto">{logo}</span>
                  ) : (
                    <span className="text-lg font-bold">{siteTitle}</span>
                  )}
                </Link>
                <p className="text-[var(--Lightlightgrey)] font-inter text-[0.625rem] font-light leading-[150%] tracking-[0.06188rem]">
                    Upptäck platsen genom andras ljudminnen
                </p>
            </div>
        </div>
        <div className='footer-logos flex flex-row gap-2 px-8 py-8'>
            <Link href="https://www.facebook.com">
                <Image 
                    src="/Facebook.svg"
                    width={16}
                    height={16}
                    alt="Facebook link"
                />
            </Link>
            <Link href="https://www.instagram.com">
                <Image 
                    src="/Instagram.svg"
                    width={16}
                    height={16}
                    alt="Instagram link"
                />
            </Link>
        </div>
    </footer>
  )
}
