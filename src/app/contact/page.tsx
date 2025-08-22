"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Contact() {
  const router = useRouter();

  // optional local state for form fields
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      "Hello, thank you for your message. We didn't finish this code so we didn't get it. Sorry!"
    );
  };

  return (
    <div className="flex justify-center py-12 px-8 grow min-h-screen bg-[var(--offwhite)]">
      <form
        onSubmit={handleSend}
        className="w-full max-w-md p-6 gap-4 flex flex-col"
      >
        <h1 className="text-2xl font-bold font-instrument text-[var(--blue)]">
          Kontakta oss
        </h1>

        {/* Email */}
        <div>
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="Din e-postadress"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="sr-only">
            Subject
          </label>
          <input
            id="subject"
            type="text"
            required
            placeholder="Ämne"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="sr-only">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            placeholder="Ditt meddelande..."
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between">
          <button type="button" onClick={() => router.push("/")} className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400" > Back </button>
          <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700" > Send </button>
        </div>

        
      </form>
    </div>
  );
}
