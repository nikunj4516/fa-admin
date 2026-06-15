import React, { useState, useEffect } from "react";
import { PlusCircle, Edit3, Trash2, X, Package, ShieldAlert } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
}

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Seeds");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [description, setDescription] = useState("");

  // Load from local storage or set defaults
  useEffect(() => {
    const saved = localStorage.getItem("farmalert_products");
    if (saved) {
      setProducts(JSON.parse(saved));
    } else {
      const defaults: Product[] = [
        { id: "p1", name: "Premium BT Cotton Seeds", category: "Seeds", price: 850, stock: 120, description: "High-yield pest-resistant cotton seeds ideal for Gujarat soils." },
        { id: "p2", name: "N-P-K Organic Fertilizer", category: "Fertilizers", price: 420, stock: 95, description: "Balanced soil nourishment mix containing natural nitrogen." },
        { id: "p3", name: "Drip Irrigation Hose (100m)", category: "Equipment", price: 2400, stock: 40, description: "Durable high-pressure drip lines for optimal water supply." }
      ];
      setProducts(defaults);
      localStorage.setItem("farmalert_products", JSON.stringify(defaults));
    }
  }, []);

  const saveProductsToStorage = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem("farmalert_products", JSON.stringify(newProducts));
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName("");
    setCategory("Seeds");
    setPrice(0);
    setStock(0);
    setDescription("");
    setShowModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price);
    setStock(p.stock);
    setDescription(p.description);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const updated = products.filter(p => p.id !== id);
    saveProductsToStorage(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProduct) {
      // Edit
      const updated = products.map(p => 
        p.id === editingProduct.id 
          ? { ...p, name, category, price: Number(price), stock: Number(stock), description }
          : p
      );
      saveProductsToStorage(updated);
    } else {
      // Create
      const newProduct: Product = {
        id: Math.random().toString(),
        name,
        category,
        price: Number(price),
        stock: Number(stock),
        description
      };
      saveProductsToStorage([...products, newProduct]);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Products Management</h2>
          <p className="text-slate-500 text-sm mt-1">Manage agricultural products catalog, crop seeds, fertilizers, and equipment stock.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-all-200 shadow-md shadow-primary/10 active:scale-95 shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between hover-card-trigger">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {p.category}
                </span>
                <span className="font-bold text-lg text-slate-800">₹{p.price}</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base leading-snug">{p.name}</h4>
                <p className="text-slate-500 text-xs mt-2 leading-relaxed line-clamp-2">{p.description}</p>
              </div>
            </div>

            <div className="border-t border-slate-50 pt-4 mt-6 flex justify-between items-center text-xs">
              <span className={`font-semibold ${p.stock > 10 ? "text-slate-500" : "text-red-500 font-bold"}`}>
                Stock: {p.stock} units {p.stock <= 10 && "(Low)"}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                >
                  <Edit3 className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-100 shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-slate-950 px-6 py-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-sm">{editingProduct ? "Edit Product" : "Create Product"}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1.5">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Neem Pesticide"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none"
                  >
                    <option value="Seeds">Seeds</option>
                    <option value="Fertilizers">Fertilizers</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Chemicals">Chemicals</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1.5">Price (INR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1.5">Stock Level</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide details about product uses and compatibility..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold text-sm transition-all-200 flex justify-center items-center gap-1.5 active:scale-95 shadow-sm"
              >
                {editingProduct ? "Save Changes" : "Create Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
