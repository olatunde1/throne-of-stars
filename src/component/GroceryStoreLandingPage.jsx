import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X, Search, CheckCircle2 } from "lucide-react";
import useProducts from "./ProductApi";
import Logo from "../assets/throne_of_stars-removebg-preview.png"

const CATEGORIES = ["All", "Meat", "Fish", "Vegetables", "Groceries", "Rice", "Leaves"];

export default function GroceryStoreLandingPage() {
  const { products, loading, error } = useProducts();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [addedMsg, setAddedMsg] = useState(null);

  const filtered = useMemo(() => {
    return products?.filter((p) => {
      const matchesCategory = category === "All" || p.category === category;
      const matchesQuery = query === "" || p.name.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [products, query, category]);

 function addToCart(product) {
  // choose a stable key for the product (prefer numeric id, but fallback to name)
  const key = product.id ?? product.name;

  setCart((prev) => {
    // find existing by the cart item's id (we store id as the chosen key)
    const existing = prev.find((c) => String(c.id) === String(key));

    if (existing) {
      // remove old entry and re-insert updated one at the end (keeps add-order)
      const without = prev.filter((c) => String(c.id) !== String(key));
      return [
        ...without,
        {
          ...existing,
          qty: (existing.qty || 0) + 1,
        },
      ];
    }

    // If new item, create a normalized cart item
    const newItem = {
      id: key,
      // keep both possible title/name keys handy
      title: product.title ?? product.name ?? "Unnamed item",
      name: product.name ?? product.title ?? "Unnamed item",
      price: Number(product.price) || 0,
      qty: 1,
      image: product.image ?? null,
      category: product.category ?? null,
    };

    return [...prev, newItem];
  });

  // show cart and a short toast-like message
  setShowCart(true);
  setAddedMsg(product.title ?? product.name ?? "Item");
  setTimeout(() => setAddedMsg(null), 2000);
}


  function updateQty(id, qty) {
    setCart((prev) =>
      prev.map((c) => (c.id === id ? { ...c, qty: Math.max(0, qty) } : c)).filter((c) => c.qty > 0)
    );
  }

  const cartTotal = () => cart.reduce((s, it) => s + it.price * it.qty, 0).toFixed(2);

  if (loading) return <p className="p-10 text-center text-gray-600">Loading products...</p>;
  if (error) return <p className="p-10 text-center text-red-500">Error loading products.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eacdf4] to-[#eacdf4] text-gray-900 relative">
      {/* Add Notification */}
      <AnimatePresence>
        {addedMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 bg-[#B42DDD] text-white px-5 py-2 rounded-full shadow-lg flex items-center gap-2 z-50"
          >
            <CheckCircle2 size={18} /> <span>{addedMsg} added to cart!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-[#330143] backdrop-blur-md shadow sticky top-0 z-30">
        <div className="container mx-auto px-6 py-2 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
            {/* <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-700 rounded-full flex items-center justify-center text-white font-bold">
              G
            </div> */}
            <img src={Logo} alt="Throne of stars" className="w-28 h-28" />
            <div>
              <h1 className="text-lg text-[#F8D718] font-bold">Throne of Stars</h1>
              <p className="text-sm text-white"></p>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:flex items-center bg-gray-100 rounded-full px-3 py-1">
              <Search size={16} className="text-gray-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search groceries..."
                className="bg-transparent ml-2 outline-none text-sm w-40"
              />
            </div>
            <button
              onClick={() => setShowCart((s) => !s)}
              className="relative bg-[#330143] hover:bg-[#330143] text-white px-3 py-2 rounded-md flex items-center gap-2"
            >
              <ShoppingCart size={18} />
              <span>{cart.reduce((s, c) => s + c.qty, 0)}</span>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar */}
        <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-5 rounded-xl shadow-lg">
          <h2 className="font-semibold mb-3">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  category === cat
                    ? "bg-[#330143] text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.aside>

        {/* Products */}
        <section className="lg:col-span-3">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-xl shadow-lg mb-6">
            <h2 className="text-2xl text-center lg:text-left font-bold mb-1">Shop Fresh Groceries</h2>
            <p className="text-sm text-gray-600">Handpicked meats, fish, and African essentials.</p>
          </motion.div>

          <motion.div layout className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {filtered?.map((item) => (
              <motion.article key={item.id} layout whileHover={{ scale: 1.02 }} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                <img
                  src={item.image || "https://via.placeholder.com/150"}
                  alt={item.name}
                  className="h-36 w-full object-cover"
                />
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                  <div className="mt-auto lg:flex items-center justify-between">
                    <div className="text-lg font-bold text-[#330143]">£{item.price}</div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => addToCart(item)}
                      className="bg-[#330143] hover:bg-[#330143] text-white px-8 py-2 rounded-md text-sm"
                    >
                      Add to Cart
                    </motion.button>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>

          {filtered?.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 bg-white p-6 rounded-md shadow text-center text-gray-600">
              No matching products found.
            </motion.div>
          )}
        </section>
      </main>

      {/* Cart Sidebar */}
           {/* Cart Preview Modal */}
      <AnimatePresence>
        {showCart && (
          <>
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-30"
              onClick={() => setShowCart(false)}
            />

            {/* Slide-in Cart Panel */}
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="fixed top-0 right-0 w-full sm:w-96 h-full bg-white shadow-2xl rounded-l-2xl flex flex-col z-40"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h4 className="text-lg font-semibold text-[#330143]">🛒 Your Cart</h4>
                <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-800">
                  <X size={22} />
                </button>
              </div>

              {/* Cart items */}
              <div className="flex-grow overflow-auto p-4 space-y-4">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center mt-20">Your cart is empty 😢</p>
                ) : (
                  cart.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between bg-gray-50 rounded-xl p-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={c.image || 'https://via.placeholder.com/60'}
                          alt={c.name}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                        <div>
                          <p className="font-medium text-sm text-[#330143]">{c.name}</p>
                          <span className="text-xs text-gray-500">
                            £{c.price} × {c.qty}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(c.id, c.qty - 1)}
                          className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-sm">{c.qty}</span>
                        <button
                          onClick={() => updateQty(c.id, c.qty + 1)}
                          className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer total + checkout */}
              <div className="p-4 border-t">
                <div className="flex items-center justify-between font-semibold text-[#330143]">
                  <span>Total:</span>
                  <span>£{cartTotal()}</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => alert("Checkout preview - coming soon")}
                  className="w-full mt-4 bg-[#330143] text-white py-3 rounded-lg hover:bg-[#4b026b] transition"
                >
                  Proceed to Checkout
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      <footer className="bg-white mt-12 border-t shadow-inner">
        <div className="container mx-auto px-6 py-6 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} © 2025 Throne of Stars. All rights reserved.
        </div>
      </footer>
    <FloatingWhatsApp />


    </div>
    
  );
}

function FloatingWhatsApp() {
  const [showBubble, setShowBubble] = React.useState(false);
  const [showWhatsApp, setShowWhatsApp] = React.useState(false);

  React.useEffect(() => {
    const bubbleTimer = setTimeout(() => setShowBubble(true), 3000);
    const showButtonTimer = setTimeout(() => {
      setShowBubble(false);
      setShowWhatsApp(true);
    }, 7000);

    const handleScroll = () => {
      if (window.scrollY > window.innerHeight / 2) {
        setShowBubble(false);
        setShowWhatsApp(true);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(bubbleTimer);
      clearTimeout(showButtonTimer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <AnimatePresence>
      {/* Welcome Chat Bubble */}
      {showBubble && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-24 right-6 bg-white text-gray-800 px-4 py-2 rounded-2xl shadow-md border border-gray-200 z-50 flex items-center space-x-2"
        >
          <span className="text-sm font-medium">Need help? Chat with us 💬</span>
          <span className="text-green-500 font-bold">WhatsApp</span>
        </motion.div>
      )}

      {/* WhatsApp Floating Button */}
      {showWhatsApp && (
        <motion.a
          href="https://wa.me/447886280225?text=Hello%20Throne%20of%20Stars%20Admin!%20I%27m%20interested%20in%20your%20products."
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg flex items-center justify-center z-50 transition-transform duration-300 hover:scale-110"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M13.601 2.326A7.87 7.87 0 008.003 0a7.996 7.996 0 00-6.99 11.93L0 16l4.153-1.09A7.965 7.965 0 008 16a7.995 7.995 0 005.658-13.674h-.057zM8.003 14.52a6.46 6.46 0 01-3.292-.896l-.235-.139-2.463.647.657-2.4-.152-.246A6.479 6.479 0 118.003 14.52z" />
            <path d="M11.745 9.485c-.2-.1-1.177-.58-1.36-.646-.182-.067-.316-.1-.45.1-.133.2-.515.646-.63.78-.117.133-.233.15-.433.05-.2-.1-.846-.312-1.61-.995a6.037 6.037 0 01-1.12-1.393c-.117-.2-.012-.3.088-.4.09-.09.2-.233.3-.35.1-.117.133-.2.2-.333.066-.133.033-.25-.017-.35-.05-.1-.45-1.08-.617-1.48-.163-.392-.33-.337-.45-.343h-.383c-.133 0-.35.05-.533.25s-.7.683-.7 1.663.717 1.93.817 2.063c.1.133 1.413 2.16 3.423 3.03.479.206.852.329 1.143.42.48.152.917.13 1.262.08.385-.058 1.177-.48 1.343-.943.167-.463.167-.86.117-.943-.05-.083-.183-.133-.383-.233z" />
          </svg>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
