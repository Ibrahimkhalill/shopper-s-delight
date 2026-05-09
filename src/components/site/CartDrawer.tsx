import { Link } from "@tanstack/react-router";
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, resolveProduct, setQty, removeFromCart, cartSubtotal, cartCount } = useStore();
  const { lang } = useT();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const ship = cartSubtotal > 1500 || cartSubtotal === 0 ? 0 : 80;
  const total = cartSubtotal + ship;
  const freeShipRemaining = Math.max(0, 1500 - cartSubtotal);
  const freeShipPct = Math.min(100, (cartSubtotal / 1500) * 100);

  return (
    <div className="fixed inset-0 z-[60] animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <aside
        className={`absolute right-0 top-0 bottom-0 w-full sm:w-[420px] bg-background shadow-2xl flex flex-col animate-slide-right ${lang === "bn" ? "font-bn" : ""}`}
        role="dialog"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="size-9 rounded-full bg-secondary flex items-center justify-center">
              <ShoppingBag className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight">Your cart</p>
              <p className="text-[11px] text-muted-foreground">{cartCount} {cartCount === 1 ? "item" : "items"}</p>
            </div>
          </div>
          <button onClick={onClose} className="size-9 rounded-full border flex items-center justify-center hover:bg-secondary transition" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        {/* Free shipping bar */}
        {cart.length > 0 && (
          <div className="px-5 pt-4 pb-3 border-b bg-secondary/30 shrink-0">
            {freeShipRemaining > 0 ? (
              <p className="text-xs text-muted-foreground mb-2">
                Add <span className="font-semibold text-foreground">৳{freeShipRemaining.toLocaleString()}</span> more for <span className="font-semibold text-accent">FREE shipping</span>
              </p>
            ) : (
              <p className="text-xs font-semibold text-accent mb-2">🎉 You unlocked FREE shipping!</p>
            )}
            <div className="h-1.5 rounded-full bg-border overflow-hidden">
              <div className="h-full bg-accent transition-all duration-500" style={{ width: `${freeShipPct}%` }} />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-6 text-center">
              <div className="size-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                <ShoppingBag className="size-8 text-muted-foreground" />
              </div>
              <p className="text-base font-semibold">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-1 mb-5">Discover amazing products and add them here.</p>
              <button onClick={onClose} className="h-11 px-6 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-90 transition">
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="p-4 space-y-3">
              {cart.map((it) => {
                const p = resolveProduct(it.id);
                if (!p) return null;
                return (
                  <li key={it.id + (it.size ?? "")} className="flex gap-3 rounded-2xl border bg-card p-3 hover:border-foreground/30 transition">
                    <Link to="/product/$id" params={{ id: p.id }} onClick={onClose} className="size-20 rounded-xl bg-secondary overflow-hidden shrink-0">
                      <img src={p.image} alt={p.name} className="size-full object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start gap-2">
                        <Link to="/product/$id" params={{ id: p.id }} onClick={onClose} className="text-sm font-medium leading-snug line-clamp-2 hover:text-accent transition flex-1">
                          {p.name}
                        </Link>
                        <button onClick={() => removeFromCart(it.id)} className="size-7 rounded-full hover:bg-secondary flex items-center justify-center shrink-0 text-muted-foreground hover:text-accent transition" aria-label="Remove">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                      {it.size && <p className="text-[11px] text-muted-foreground mt-0.5">Size: {it.size}</p>}
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center rounded-full border h-8">
                          <button onClick={() => setQty(it.id, it.qty - 1)} disabled={it.qty <= 1} className="size-8 flex items-center justify-center disabled:opacity-30 hover:bg-secondary rounded-l-full transition">
                            <Minus className="size-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold">{it.qty}</span>
                          <button onClick={() => setQty(it.id, it.qty + 1)} className="size-8 flex items-center justify-center hover:bg-secondary rounded-r-full transition">
                            <Plus className="size-3" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold">৳{(p.price * it.qty).toLocaleString()}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t bg-card shrink-0 p-5 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground font-medium">৳{cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className={ship === 0 ? "text-accent font-semibold" : "text-foreground font-medium"}>
                  {ship === 0 ? "FREE" : `৳${ship}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t mt-2">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold">৳{total.toLocaleString()}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to="/cart"
                onClick={onClose}
                className="h-12 rounded-full border-2 border-foreground/90 text-sm font-semibold flex items-center justify-center hover:bg-secondary transition"
              >
                View cart
              </Link>
              <Link
                to="/checkout"
                onClick={onClose}
                className="h-12 rounded-full bg-foreground text-background text-sm font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition group"
              >
                Checkout <ArrowRight className="size-4 group-hover:translate-x-0.5 transition" />
              </Link>
            </div>
            <p className="text-[10px] text-center text-muted-foreground pt-1">Secure checkout · COD · bKash · Nagad</p>
          </div>
        )}
      </aside>
    </div>
  );
}
