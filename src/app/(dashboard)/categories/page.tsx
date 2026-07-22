"use client";

import { useEffect, useState } from "react";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  UtensilsCrossed,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  description: string | null;
  isHidden: boolean;
  isDisabled: boolean;
  displayOrder: number;
  _count: {
    menuItems: number;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isHidden: false,
    isDisabled: false,
  });
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "", isHidden: false, isDisabled: false });
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      isHidden: category.isHidden,
      isDisabled: category.isDisabled,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setSaving(true);
    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save category");
      }

      toast.success(editingCategory ? "Category updated!" : "Category created!");
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleHide = async (category: Category) => {
    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHidden: !category.isHidden }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(category.isHidden ? "Category made visible" : "Category hidden from public menu");
        fetchCategories();
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Category deleted!");
        fetchCategories();
      } else {
        toast.error(data.error || "Failed to delete category");
      }
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const newItems = [...categories];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    // Swap display order
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const reorderedPayload = newItems.map((cat, idx) => ({
      id: cat.id,
      displayOrder: idx,
    }));

    setCategories(newItems);

    try {
      await fetch("/api/categories/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: reorderedPayload }),
      });
      toast.success("Categories reordered!");
    } catch {
      toast.error("Failed to save reorder");
      fetchCategories();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2">
            <Tag className="h-7 w-7 text-primary" /> Menu Categories
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Organize your dishes into sections (e.g. Starters, Main Course, Drinks, Desserts).
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 gradient-primary text-white font-semibold px-4 py-2.5 rounded-xl text-sm shadow-md hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl p-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-600 mb-4">
            <Tag className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold">No categories created yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1 mb-6">
            Start by creating your first category like &quot;Starters&quot; or &quot;Beverages&quot;.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 gradient-primary text-white font-semibold px-5 py-2.5 rounded-xl text-sm"
          >
            <Plus className="h-4 w-4" /> Create Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {categories.map((cat, index) => (
            <div
              key={cat.id}
              className={`p-5 rounded-2xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                cat.isHidden ? "opacity-60 bg-muted/30" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex flex-col gap-1 mt-1">
                  <button
                    disabled={index === 0}
                    onClick={() => handleMoveOrder(index, "up")}
                    className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    disabled={index === categories.length - 1}
                    onClick={() => handleMoveOrder(index, "down")}
                    className="p-1 rounded hover:bg-muted text-muted-foreground disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base">{cat.name}</h3>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                      <UtensilsCrossed className="h-3 w-3" /> {cat._count.menuItems} items
                    </span>
                    {cat.isHidden && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                        Hidden
                      </span>
                    )}
                  </div>
                  {cat.description && (
                    <p className="text-xs text-muted-foreground mt-1">{cat.description}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleToggleHide(cat)}
                  title={cat.isHidden ? "Unhide Category" : "Hide Category"}
                  className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground transition-colors"
                >
                  {cat.isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 text-green-600" />}
                </button>
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Edit Category"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  disabled={deletingId === cat.id}
                  onClick={() => handleDelete(cat.id)}
                  className="p-2 rounded-xl border border-border hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                  title="Delete Category"
                >
                  {deletingId === cat.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Starters, Main Course, Drinks"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Short note describing this category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-hidden focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isHidden"
                  checked={formData.isHidden}
                  onChange={(e) => setFormData({ ...formData, isHidden: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="isHidden" className="text-sm font-medium cursor-pointer">
                  Hide from public menu
                </label>
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
                  {editingCategory ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
