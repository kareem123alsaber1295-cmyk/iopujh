"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, TrendingUp, Clock, ArrowRight, Sparkles, Flame,
} from "lucide-react";
import {
  searchProducts, getTrendingProducts, getRecentSearches,
  addRecentSearch, clearRecentSearches, TRENDING_SEARCHES,
  type Product,
} from "@/lib/products";

function TrendBadge({ score }: { score: number }) {
  const color =
    score >= 88 ? "bg-rose-50 text-rose-600 border-rose-200" :
    score >= 78 ? "bg-amber-50 text-amber-600 border-amber-200" :
    "bg-emerald-50 text-emerald-600 border-emerald-200";
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${color} flex items-center gap-0.5`}>
      <Flame className="h-2.5 w-2.5" />
      {score}
    </span>
  );
}

function ProductRow({
  product, active, onSelect, query,
}: {
  product: Product;
  active: boolean;
  onSelect: (p: Product) => void;
  query: string;
}) {
  const parts = product.name.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "i"));

  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onSelect(product); }}
      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${
        active ? "bg-secondary/70" : "hover:bg-secondary/40"
      }`}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
        style={{ background: `${product.accentColor}20`, border: `1.5px solid ${product.accentColor}30` }}
      >
        {product.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase()
              ? <mark key={i} className="bg-primary/15 text-primary font-semibold rounded px-0.5">{part}</mark>
              : part
          )}
        </p>
        <p className="text-xs text-muted-foreground truncate">{product.brand} · {product.category}</p>
      </div>
      <TrendBadge score={product.trendScore} />
    </button>
  );
}

function SearchDropdown({
  query, results, recentSearches, activeIndex,
  onSelectProduct, onSelectQuery, onClearRecent,
}: {
  query: string;
  results: Product[];
  recentSearches: string[];
  activeIndex: number;
  onSelectProduct: (p: Product) => void;
  onSelectQuery: (q: string) => void;
  onClearRecent: () => void;
}) {
  const trending = getTrendingProducts(5);
  const hasQuery = query.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.98 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-2xl shadow-2xl shadow-black/10 overflow-hidden z-[100]"
      style={{ minWidth: 420 }}
    >
      {hasQuery ? (
        <>
          {results.length > 0 ? (
            <div>
              <div className="px-4 pt-3 pb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Products
                </span>
                <span className="text-[10px] text-muted-foreground">{results.length} results</span>
              </div>
              {results.map((p, i) => (
                <ProductRow
                  key={p.id}
                  product={p}
                  active={activeIndex === i}
                  onSelect={onSelectProduct}
                  query={query}
                />
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">No products found for <strong>"{query}"</strong></p>
              <p className="text-xs text-muted-foreground mt-1">Try "skincare", "supplements", or a brand name</p>
            </div>
          )}
          {results.length > 0 && (
            <div className="border-t border-border px-4 py-2.5">
              <button
                onMouseDown={(e) => { e.preventDefault(); onSelectQuery(query); }}
                className="w-full flex items-center gap-2 text-sm text-primary font-medium hover:underline"
              >
                <Search className="h-3.5 w-3.5" />
                Search all results for &ldquo;{query}&rdquo;
                <ArrowRight className="h-3.5 w-3.5 ml-auto" />
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div className="pb-2">
              <div className="px-4 pt-3 pb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> Recent
                </span>
                <button
                  onMouseDown={(e) => { e.preventDefault(); onClearRecent(); }}
                  className="text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((s, i) => (
                <button
                  key={s}
                  onMouseDown={(e) => { e.preventDefault(); onSelectQuery(s); }}
                  className={`w-full flex items-center gap-3 px-4 py-2 transition-colors text-left ${
                    activeIndex === i ? "bg-secondary/70" : "hover:bg-secondary/40"
                  }`}
                >
                  <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground/80 flex-1 truncate">{s}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}

          {/* Trending searches */}
          <div className={recentSearches.length > 0 ? "border-t border-border pt-2 pb-2" : "pt-2 pb-2"}>
            <div className="px-4 pt-1 pb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3" /> Trending Searches
              </span>
            </div>
            <div className="px-4 py-1.5 flex flex-wrap gap-2">
              {TRENDING_SEARCHES.slice(0, 8).map((s) => (
                <button
                  key={s}
                  onMouseDown={(e) => { e.preventDefault(); onSelectQuery(s); }}
                  className="text-xs font-medium px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/70 border border-border transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Trending products */}
          <div className="border-t border-border pt-2 pb-2">
            <div className="px-4 pt-1 pb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Hot Products
              </span>
            </div>
            {trending.map((p, i) => (
              <ProductRow
                key={p.id}
                product={p}
                active={activeIndex === recentSearches.length + i}
                onSelect={onSelectProduct}
                query=""
              />
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim()) {
      setResults(searchProducts(query));
      setActiveIndex(-1);
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    if (open || mobileOpen) {
      setRecentSearches(getRecentSearches());
    }
  }, [open, mobileOpen]);

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      setTimeout(() => mobileInputRef.current?.focus(), 50);
    }
  }, [mobileOpen]);

  const maxIndex = query.trim()
    ? results.length - 1
    : recentSearches.length + getTrendingProducts(5).length - 1;

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, maxIndex));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setMobileOpen(false);
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && query.trim() && results[activeIndex]) {
        selectProduct(results[activeIndex]);
      } else if (query.trim()) {
        selectQuery(query);
      }
    }
  }

  const selectProduct = useCallback((p: Product) => {
    addRecentSearch(p.name);
    setQuery("");
    setOpen(false);
    setMobileOpen(false);
    router.push(`/dashboard/product/${p.id}`);
  }, [router]);

  const selectQuery = useCallback((q: string) => {
    addRecentSearch(q);
    const found = searchProducts(q, 1);
    setQuery("");
    setOpen(false);
    setMobileOpen(false);
    if (found.length > 0) {
      router.push(`/dashboard/product/${found[0].id}`);
    }
  }, [router]);

  const clearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  return (
    <>
      {/* Desktop search */}
      <div ref={containerRef} className="relative hidden sm:block w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none z-10" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search products, brands..."
          className="w-full h-9 pl-9 pr-8 rounded-xl bg-secondary/60 text-sm focus:outline-none focus:ring-2 focus:ring-ring border border-transparent focus:border-border transition-all placeholder:text-muted-foreground/60"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        )}

        <AnimatePresence>
          {open && (
            <SearchDropdown
              query={query}
              results={results}
              recentSearches={recentSearches}
              activeIndex={activeIndex}
              onSelectProduct={selectProduct}
              onSelectQuery={selectQuery}
              onClearRecent={clearRecent}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Mobile search icon */}
      <button
        className="sm:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
        onClick={() => setMobileOpen(true)}
      >
        <Search className="h-4.5 w-4.5" />
      </button>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-background flex flex-col sm:hidden"
          >
            {/* Mobile header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  ref={mobileInputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Search products, brands..."
                  className="w-full h-10 pl-9 pr-9 rounded-xl border border-input bg-secondary/40 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={() => { setMobileOpen(false); setQuery(""); }}
                className="text-sm font-medium text-primary shrink-0"
              >
                Cancel
              </button>
            </div>

            {/* Mobile results */}
            <div className="flex-1 overflow-y-auto">
              {query.trim() ? (
                results.length > 0 ? (
                  <>
                    <div className="px-4 pt-4 pb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {results.length} Products
                      </span>
                    </div>
                    {results.map((p) => (
                      <ProductRow key={p.id} product={p} active={false} onSelect={selectProduct} query={query} />
                    ))}
                  </>
                ) : (
                  <div className="py-16 text-center px-8">
                    <p className="text-sm text-muted-foreground">No products found for <strong>"{query}"</strong></p>
                    <p className="text-xs text-muted-foreground mt-1">Try a brand name or category</p>
                  </div>
                )
              ) : (
                <>
                  {recentSearches.length > 0 && (
                    <div className="pt-4 pb-2">
                      <div className="px-4 pb-2 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Recent</span>
                        <button onClick={clearRecent} className="text-[10px] text-muted-foreground">Clear</button>
                      </div>
                      {recentSearches.map((s) => (
                        <button
                          key={s}
                          onClick={() => selectQuery(s)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/40 transition-colors"
                        >
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm flex-1 text-left">{s}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 pb-2">
                    <div className="px-4 pb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Trending</span>
                    </div>
                    <div className="px-4 flex flex-wrap gap-2 pb-4">
                      {TRENDING_SEARCHES.map((s) => (
                        <button
                          key={s}
                          onClick={() => selectQuery(s)}
                          className="text-sm font-medium px-3 py-2 rounded-xl bg-secondary border border-border"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 pb-2">
                    <div className="px-4 pb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Hot Right Now</span>
                    </div>
                    {getTrendingProducts(6).map((p) => (
                      <ProductRow key={p.id} product={p} active={false} onSelect={selectProduct} query="" />
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
