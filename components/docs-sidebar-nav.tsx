"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Code,
  MessageCircle,
  Settings,
  BookOpen,
  FileText,
  Github,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Define navigation items (может быть передано как пропс или определено здесь)
const sidebarNavItems = [
  { title: "Introduction", id: "introduction", icon: FileText },
  { title: "Installation", id: "installation", icon: Code },
  { title: "Basic Usage", id: "usage", icon: MessageCircle },
  { title: "Configuration", id: "configuration", icon: Settings },
  { title: "Advanced Usage", id: "advanced", icon: BookOpen },
  { title: "Examples", id: "examples", icon: FileText }, // Add examples if section exists
  // Добавьте другие секции по мере необходимости
];

// Helper function to format numbers (e.g., 1200 -> 1.2k)
const formatStars = (stars: number): string => {
  if (stars >= 1000) {
    return (stars / 1000).toFixed(1) + "k";
  }
  return stars.toString();
};

export function DocsSidebarNav() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [starCount, setStarCount] = useState<number | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // Fetch GitHub stars on mount
  useEffect(() => {
    fetch("https://api.github.com/repos/ijustseen/doctalkie-react")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data && typeof data.stargazers_count === "number") {
          setStarCount(data.stargazers_count);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch GitHub stars:", error);
        // Keep starCount as null if fetch fails
      });
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    // Initialize activeId based on initial hash or first item
    const initialHash = window.location.hash.substring(1);
    setActiveId(initialHash || sidebarNavItems[0]?.id || null);

    const sectionElements = sidebarNavItems
      .map(({ id }) => document.getElementById(id))
      .filter((el) => el !== null) as HTMLElement[];

    if (sectionElements.length === 0) return;

    // New observer callback based on ChatGPT suggestion
    const observerCallback: IntersectionObserverCallback = (entries) => {
      const visibleSections = entries
        .filter((entry) => entry.isIntersecting)
        // Sort by intersection ratio (highest first)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      // If there are visible sections, set the most visible one as active
      if (visibleSections.length > 0) {
        setActiveId(visibleSections[0].target.id);
      }
      // If no sections are visible in the observed area,
      // the activeId remains the last one set (no else clause needed here)
    };

    observer.current = new IntersectionObserver(observerCallback, {
      // Observe the top 30% of the viewport
      rootMargin: "0px 0px -70% 0px",
      // Trigger when at least 10% of the element is visible
      threshold: 0.1,
    });

    sectionElements.forEach((el) => observer.current?.observe(el));

    return () => {
      // Disconnect observer on cleanup
      observer.current?.disconnect();
    };
  }, []); // Re-run only if sidebarNavItems potentially changes (it's const here)

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    setActiveId(id);
    // Browser handles the scroll
  };

  return (
    <nav className="sticky top-16 -mt-10 pt-10 h-[calc(100vh-4rem)] w-full pr-6 overflow-y-auto flex flex-col">
      <div className="space-y-4 flex-grow">
        <p className="font-medium">On this page</p>
        <ul className="space-y-1">
          {sidebarNavItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleClick(e, item.id)}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary hover:text-accent-foreground",
                  activeId === item.id
                    ? "bg-secondary text-primary font-medium"
                    : "text-muted-foreground"
                )}
              >
                <item.icon
                  className="mr-2 h-4 w-4 flex-shrink-0"
                  aria-hidden="true"
                />
                <span>{item.title}</span>
              </a>
            </li>
          ))}
          {/* GitHub Star Button with count and icon */}
          <li className="mt-4">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a
                href="https://github.com/ijustseen/doctalkie-react"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2"
              >
                <Github className="h-4 w-4" />
                <span className="inline-flex items-center">
                  Star us on GitHub
                  {starCount !== null && (
                    <span className="ml-2 inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                      <Star className="mr-1 h-3 w-3" />
                      {formatStars(starCount)}
                    </span>
                  )}
                </span>
              </a>
            </Button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
