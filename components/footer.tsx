import Link from "next/link";
import { Github, Linkedin, Mail, Send, Twitter } from "lucide-react";

export default function Footer() {
  const GITHUB_URL = "https://github.com/ijustseen/doctalkie-react";
  const LINKEDIN_URL =
    "https://www.linkedin.com/in/andrew-eroshenkov-27235a30b/";
  const EMAIL_ADDRESS = "mailto:anordgame@gmail.com";
  const TELEGRAM_URL = "https://t.me/andr_ewtf";
  const X_URL = "https://x.com/ijustseen_you";

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold gradient-text">
                DocTalkie
              </span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Your AI Assistant, Ready to help. Easily integrate an AI assistant
              into any React web app.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Product</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/plans"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Plans
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/changelog"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Changelog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium">Contacts</h3>
            <div className="flex items-center gap-x-4 mt-3">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href={EMAIL_ADDRESS}
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Telegram"
              >
                <Send className="h-5 w-5" />
              </a>
              <a
                href={X_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="X (Twitter)"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} DocTalkie. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link
              href="#"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
