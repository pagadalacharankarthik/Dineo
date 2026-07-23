"use client";

import { useEffect, useState, useRef } from "react";
import {
  UtensilsCrossed,
  Plus,
  Search,
  Pencil,
  Trash2,
  Copy,
  Upload,
  Sparkles,
  Flame,
  ChefHat,
  Loader2,
  X,
  Filter,
  Eye,
  EyeOff,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discountPrice: number | null;
  imageUrl: string | null;
  isVeg: boolean;
  isRecommended: boolean;
  isBestSeller: boolean;
  isChefSpecial: boolean;
  isAvailable: boolean;
  isHidden: boolean;
  categoryId: string;
  category: Category;
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Bulk Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkCategoryId, setBulkCategoryId] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    description: "",
    price: "",
    discountPrice: "",
    imageUrl: "",
    isVeg: true,
    isRecommended: false,
    isBestSeller: false,
    isChefSpecial: false,
    isAvailable: true,
    isHidden: false,
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      const [catsRes, itemsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/menu-items"),
      ]);
      const catsData = await catsRes.json();
      const itemsData = await itemsRes.json();

      if (catsData.success) setCategories(catsData.data);
      if (itemsData.success) setItems(itemsData.data);
    } catch {
      toast.error("Failed to load menu data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openBulkAddModal = () => {
    setBulkCategoryId(selectedCategory !== "all" ? selectedCategory : (categories[0]?.id || ""));
    setBulkText("");
    setIsBulkModalOpen(true);
  };

  const handleBulkSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkCategoryId) {
      toast.error("Please select a category");
      return;
    }

    const lines = bulkText.split("\n");
    const parsedItems: { name: string; price: number; description?: string; isVeg: boolean }[] = [];
    let hasError = false;

    lines.forEach((line, index) => {
      if (hasError) return;
      const trimmed = line.trim();
      if (!trimmed) return;

      const parts = trimmed.split("|");
      const name = parts[0]?.trim();
      const priceRaw = parts[1]?.trim();
      const description = parts[2]?.trim() || "";
      const vegIndicator = parts[3]?.trim()?.toLowerCase() || "v";

      if (!name) {
        toast.error(`Line ${index + 1}: Dish name is missing.`);
        hasError = true;
        return;
      }
      if (!priceRaw) {
        toast.error(`Line ${index + 1}: Price is missing.`);
        hasError = true;
        return;
      }

      const price = parseFloat(priceRaw);
      if (isNaN(price) || price < 0) {
        toast.error(`Line ${index + 1}: Invalid price "${priceRaw}".`);
        hasError = true;
        return;
      }

      parsedItems.push({
        name,
        price,
        description: description || undefined,
        isVeg: vegIndicator === "v" || vegIndicator === "veg",
      });
    });

    if (hasError) return;

    if (parsedItems.length === 0) {
      toast.error("Please enter at least one valid item to add.");
      return;
    }

    setBulkSaving(true);
    try {
      const res = await fetch("/api/menu-items/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: bulkCategoryId,
          items: parsedItems,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to bulk add items");
      }

      toast.success(data.message || `Successfully added ${parsedItems.length} items!`);
      setIsBulkModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      toast.error(msg);
    } finally {
      setBulkSaving(false);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      categoryId: categories[0]?.id || "",
      description: "",
      price: "",
      discountPrice: "",
      imageUrl: "",
      isVeg: true,
      isRecommended: false,
      isBestSeller: false,
      isChefSpecial: false,
      isAvailable: true,
      isHidden: false,
    });
    setIsModalOpen(true);
  };

  const handleDownloadMenuPDF = async () => {
    if (items.length === 0) return;
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      
      // Header Branding banner
      doc.setFillColor(249, 115, 22);
      doc.rect(0, 0, 210, 40, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text("Restaurant Digital Menu", 14, 25);
      
      let y = 50;
      categories.forEach((cat) => {
        const catItems = items.filter((i) => i.categoryId === cat.id);
        if (catItems.length === 0) return;
        
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(249, 115, 22);
        doc.text(cat.name, 14, y);
        doc.line(14, y + 2, 196, y + 2);
        
        y += 10;
        
        catItems.forEach((item) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(30, 41, 59);
          
          const vegSymbol = item.isVeg ? "[V]" : "[N]";
          doc.text(`${vegSymbol} ${item.name}`, 14, y);
          
          const activePrice = item.discountPrice !== null && item.discountPrice !== undefined 
            ? `Rs. ${item.discountPrice.toFixed(2)} (Offer!)` 
            : `Rs. ${item.price.toFixed(2)}`;
          doc.text(activePrice, 196 - doc.getTextWidth(activePrice), y);
          
          if (item.description) {
            doc.setFont("helvetica", "italic");
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            doc.text(item.description.substring(0, 100), 14, y + 5);
            y += 12;
          } else {
            y += 8;
          }
        });
        
        y += 6;
      });
      
      doc.save(`restaurant-menu.pdf`);
      toast.success("Menu PDF downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF menu");
    }
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      categoryId: item.categoryId,
      description: item.description || "",
      price: item.price.toString(),
      discountPrice: item.discountPrice !== null && item.discountPrice !== undefined ? item.discountPrice.toString() : "",
      imageUrl: item.imageUrl || "",
      isVeg: item.isVeg,
      isRecommended: item.isRecommended,
      isBestSeller: item.isBestSeller,
      isChefSpecial: item.isChefSpecial,
      isAvailable: item.isAvailable,
      isHidden: item.isHidden,
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (data.success) {
        setFormData((prev) => ({ ...prev, imageUrl: data.url }));
        toast.success("Image uploaded!");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Item name is required");
      return;
    }
    if (!formData.categoryId) {
      toast.error("Please select a category");
      return;
    }
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (!formData.imageUrl || !formData.imageUrl.trim()) {
      toast.error("Please upload or provide an image for the menu item");
      return;
    }

    const discountPriceNum = formData.discountPrice ? parseFloat(formData.discountPrice) : null;
    if (discountPriceNum !== null && (isNaN(discountPriceNum) || discountPriceNum < 0)) {
      toast.error("Please enter a valid discount price");
      return;
    }
    if (discountPriceNum !== null && discountPriceNum > priceNum) {
      toast.error("Discount price cannot exceed the original price");
      return;
    }

    setSaving(true);
    try {
      const url = editingItem ? `/api/menu-items/${editingItem.id}` : "/api/menu-items";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: priceNum,
          discountPrice: discountPriceNum,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save menu item");
      }

      toast.success(editingItem ? "Menu item updated!" : "Menu item created!");
      setIsModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStock = async (item: MenuItem) => {
    try {
      const res = await fetch(`/api/menu-items/${item.id}/toggle-availability`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchData();
      }
    } catch {
      toast.error("Failed to update availability");
    }
  };

  const handleDuplicate = async (item: MenuItem) => {
    try {
      const res = await fetch(`/api/menu-items/${item.id}/duplicate`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Item duplicated!");
        fetchData();
      }
    } catch {
      toast.error("Failed to duplicate item");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/menu-items/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Item deleted!");
        fetchData();
      } else {
        toast.error(data.error || "Failed to delete item");
      }
    } catch {
      toast.error("Failed to delete item");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === "all" || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2">
            <UtensilsCrossed className="h-7 w-7 text-primary" /> Menu Items
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Add dishes, prices, photos, badges, and toggle availability in real-time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadMenuPDF}
            disabled={items.length === 0}
            className="inline-flex items-center justify-center gap-2 border border-border bg-card hover:bg-muted font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4 text-primary" /> Download PDF Menu
          </button>
          <button
            disabled={categories.length === 0}
            onClick={openBulkAddModal}
            className="inline-flex items-center justify-center gap-2 border border-primary text-primary hover:bg-primary/5 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" /> Bulk Add Items
          </button>
          <button
            disabled={categories.length === 0}
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 gradient-primary text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Menu Item
          </button>
        </div>
      </div>

      {categories.length === 0 && !loading && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-sm flex items-center justify-between">
          <span>You need at least one category before adding menu items.</span>
          <a href="/categories" className="font-semibold underline hover:text-amber-900">
            Create Category →
          </a>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search dish or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === "all"
                ? "gradient-primary text-white"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All Items ({items.length})
          </button>
          {categories.map((cat) => {
            const count = items.filter((i) => i.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? "gradient-primary text-white"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading menu items...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl p-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950/30 text-blue-600 mb-4">
            <UtensilsCrossed className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold">No menu items found</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1 mb-6">
            {searchQuery
              ? "No dishes match your search query."
              : "Add your first dish to showcase on your digital menu."}
          </p>
          {categories.length > 0 && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 gradient-primary text-white font-semibold px-5 py-2.5 rounded-xl text-sm"
            >
              <Plus className="h-4 w-4" /> Add Menu Item
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border border-border bg-card flex flex-col justify-between transition-all hover:shadow-md ${
                !item.isAvailable ? "opacity-75 bg-muted/20" : ""
              }`}
            >
              <div>
                {/* Image + Badges */}
                <div className="relative h-40 w-full rounded-xl overflow-hidden bg-muted mb-3">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                      <UtensilsCrossed className="h-10 w-10" />
                    </div>
                  )}

                  {/* Veg / NonVeg Icon */}
                  <div className="absolute top-2 left-2 bg-background/95 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-bold border border-border flex items-center gap-1 shadow-sm">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        item.isVeg ? "bg-green-600" : "bg-red-600"
                      }`}
                    />
                    {item.isVeg ? "VEG" : "NON-VEG"}
                  </div>

                  {/* Out of Stock Banner */}
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                      <span className="bg-red-600 text-white font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                        Out of Stock
                      </span>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute bottom-2 right-2 flex flex-wrap gap-1">
                    {item.isRecommended && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        <Sparkles className="h-2.5 w-2.5" /> Recommended
                      </span>
                    )}
                    {item.isBestSeller && (
                      <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        <Flame className="h-2.5 w-2.5" /> Bestseller
                      </span>
                    )}
                    {item.isChefSpecial && (
                      <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        <ChefHat className="h-2.5 w-2.5" /> Chef Special
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <h3 className="font-bold text-base leading-snug">{item.name}</h3>
                    <p className="text-xs text-primary font-medium mt-0.5">
                      {item.category?.name}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {item.discountPrice !== null && item.discountPrice !== undefined ? (
                      <div>
                        <p className="text-base font-extrabold text-primary">
                          ₹{item.discountPrice.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-muted-foreground line-through font-medium">
                          ₹{item.price.toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-base font-extrabold gradient-text">
                        ₹{item.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1 mb-3">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Action Bar */}
              <div className="pt-3 border-t border-border mt-3 flex items-center justify-between gap-2">
                {/* Out of Stock Toggle */}
                <button
                  onClick={() => handleToggleStock(item)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors ${
                    item.isAvailable
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
                      : "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                  }`}
                >
                  {item.isAvailable ? "In Stock" : "Out of Stock"}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicate(item)}
                    title="Duplicate Item"
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => openEditModal(item)}
                    title="Edit Item"
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    disabled={deletingId === item.id}
                    onClick={() => handleDelete(item.id)}
                    title="Delete Item"
                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Menu Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg shadow-2xl my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold">
                {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Dish Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paneer Butter Masala"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  >
                    <option value="" disabled>
                      Select Category
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="250.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Discount Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 199.00"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Dietary Type
                  </label>
                  <div className="flex items-center gap-4 mt-2.5">
                    <label className="flex items-center gap-2 text-sm cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="isVeg"
                        checked={formData.isVeg}
                        onChange={() => setFormData({ ...formData, isVeg: true })}
                        className="text-primary"
                      />
                      🟢 Veg
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="isVeg"
                        checked={!formData.isVeg}
                        onChange={() => setFormData({ ...formData, isVeg: false })}
                        className="text-primary"
                      />
                      🔴 Non-Veg
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Ingredients, taste profile, or special details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-hidden focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Dish Image
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Image URL or upload file →"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-border bg-background text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-muted hover:bg-muted/80 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload
                  </button>
                </div>
              </div>

              {/* Badges Toggles */}
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="block text-xs font-semibold uppercase text-muted-foreground">
                  Special Badges
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 p-2 rounded-xl border border-border bg-card text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isRecommended}
                      onChange={(e) =>
                        setFormData({ ...formData, isRecommended: e.target.checked })
                      }
                      className="rounded text-primary"
                    />
                    ⭐ Recommended
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl border border-border bg-card text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isBestSeller}
                      onChange={(e) =>
                        setFormData({ ...formData, isBestSeller: e.target.checked })
                      }
                      className="rounded text-primary"
                    />
                    🔥 Bestseller
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl border border-border bg-card text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isChefSpecial}
                      onChange={(e) =>
                        setFormData({ ...formData, isChefSpecial: e.target.checked })
                      }
                      className="rounded text-primary"
                    />
                    👨‍🍳 Chef Special
                  </label>
                </div>
              </div>

              {/* Status Toggles */}
              <div className="space-y-2 pt-3 border-t border-border">
                <label className="block text-xs font-semibold uppercase text-muted-foreground">
                  Availability & Visibility
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/40 border border-border/50">
                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) =>
                        setFormData({ ...formData, isAvailable: e.target.checked })
                      }
                      className="rounded text-primary"
                    />
                    🟢 Item Available (In Stock)
                  </label>

                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isHidden}
                      onChange={(e) =>
                        setFormData({ ...formData, isHidden: e.target.checked })
                      }
                      className="rounded text-primary"
                    />
                    👁️ Hide from public menu
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 gradient-primary text-white font-semibold px-5 py-2 rounded-xl text-sm disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingItem ? "Update Menu Item" : "Create Menu Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Menu Items Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-2xl shadow-2xl my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-lg font-bold">Bulk Add Menu Items</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Add multiple items at once to a selected category.</p>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBulkSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Destination Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={bulkCategoryId}
                  onChange={(e) => setBulkCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                >
                  <option value="" disabled>
                    Select Category
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase text-muted-foreground">
                    Menu Items Data <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Format: Name | Price | Description | Veg (V/N)
                  </span>
                </div>
                <textarea
                  rows={8}
                  required
                  placeholder={`e.g.\nPaneer Tikka | 250 | Grilled cottage cheese | V\nChicken Biryani | 350 | Slow cooked basmati rice | N\nCold Coffee | 120 | Blended ice cream and espresso | V`}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="bg-muted/40 border border-border p-3.5 rounded-2xl text-xs space-y-1">
                <p className="font-semibold text-foreground">💡 Instructions:</p>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li>Write one dish per line.</li>
                  <li>Separate each value using a pipe character (<code className="font-bold">|</code>).</li>
                  <li>Use <code className="font-bold">V</code> or <code className="font-bold">Veg</code> for vegetarian, and <code className="font-bold">N</code> or <code className="font-bold">Non-Veg</code> for non-vegetarian.</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkSaving}
                  className="inline-flex items-center gap-2 gradient-primary text-white font-semibold px-5 py-2 rounded-xl text-sm disabled:opacity-50"
                >
                  {bulkSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Bulk Import Items
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
