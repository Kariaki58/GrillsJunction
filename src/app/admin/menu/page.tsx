'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit2, Trash2, Plus, Search, Loader2, UploadCloud } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface MenuItem {
  id: number;
  name: string;
  desc: string;
  price: number;
  category: string;
  rating: number;
  badge: string | null;
  image: string;
}

interface MenuItemFormData {
  name: string;
  desc: string;
  price: number;
  category: string;
  rating: number;
  badge: string;
  image: string;
}

interface Category {
  id: number;
  name: string;
  image: string;
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: '',
    desc: '',
    price: 0,
    category: '',
    rating: 5.0,
    badge: '',
    image: '',
  });

  const supabase = createClient();
  const { toast } = useToast();

  const fetchItems = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('menu_items').select('*').order('id', { ascending: true });
    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch menu items.', variant: 'destructive' });
    } else {
      setItems(data || []);
    }
    setIsLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*').order('id', { ascending: true });
    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch categories.', variant: 'destructive' });
      setCategories([]);
    } else {
      setCategories(data || []);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!formData.category && categories.length > 0) {
      setFormData((prev) => ({ ...prev, category: categories[0].name }));
    }
  }, [categories, formData.category]);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = () => {
    setEditingItem(null);
    setImageFile(null);
    setFormData({
      name: '',
      desc: '',
      price: 0,
      category: 'Meat',
      rating: 5.0,
      badge: '',
      image: '',
    });
    setDialogOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setImageFile(null);
    setFormData({
      name: item.name,
      desc: item.desc || '',
      price: item.price,
      category: item.category,
      rating: item.rating,
      badge: item.badge || '',
      image: item.image || '',
    });
    setDialogOpen(true);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploadingImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(filePath, file);

    setUploadingImage(false);

    if (uploadError) {
      toast({ title: 'Upload Failed', description: uploadError.message, variant: 'destructive' });
      return null;
    }

    const { data } = supabase.storage.from('menu-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSaveItem = async () => {
    setIsSaving(true);
    
    let imageUrl = formData.image;
    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        setIsSaving(false);
        return; // Stop if upload failed
      }
    }

    const itemToSave = {
      name: formData.name,
      desc: formData.desc,
      price: formData.price,
      category: formData.category,
      rating: formData.rating,
      badge: formData.badge || null,
      image: imageUrl,
    };

    if (editingItem) {
      const { error } = await supabase
        .from('menu_items')
        .update(itemToSave)
        .eq('id', editingItem.id);
        
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Item updated successfully.' });
        fetchItems();
        setDialogOpen(false);
      }
    } else {
      const { error } = await supabase
        .from('menu_items')
        .insert([itemToSave]);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Item created successfully.' });
        fetchItems();
        setDialogOpen(false);
      }
    }
    setIsSaving(false);
  };

  const handleDeleteItem = async (id: number) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Item deleted.' });
      fetchItems();
    }
  };


  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{items.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Menu Items</CardTitle>
              <CardDescription>Manage your menu items and inventory</CardDescription>
            </div>
            <Button onClick={handleAddItem} className="gap-2 bg-gradient-to-r from-orange-500 to-red-500">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search menu items..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="py-20 text-center flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Mobile Cards View */}
              <div className="md:hidden space-y-3">
                {filteredItems.map(item => (
                  <div key={item.id} className="p-3 border border-slate-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-900">{item.name}</h3>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Item?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{item.desc}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-slate-500">Price</p>
                        <p className="font-bold">₦{Number(item.price).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Category</p>
                        <p className="font-bold">{item.category}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>
                           {item.image && item.image.startsWith('http') ? (
                             <Image src={item.image} alt={item.name} width={40} height={40} className="rounded-md object-cover h-10 w-10" />
                           ) : (
                             <div className="h-10 w-10 bg-slate-100 flex items-center justify-center rounded-md text-xs text-slate-400">No Img</div>
                           )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">{item.name}</p>
                            <p className="text-sm text-slate-500">{item.desc}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                           <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700">
                             {item.category}
                           </span>
                        </TableCell>
                        <TableCell className="font-medium">₦{Number(item.price).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditItem(item)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Item?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Deleting "{item.name}" cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredItems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                          No menu items found. Add one!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit/Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md md:max-w-lg overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the menu item details' : 'Create a new menu item'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="image">Item Image</Label>
              <div className="mt-2 flex items-center gap-4">
                {(imageFile || formData.image) && (
                  <div className="relative h-16 w-16 rounded-md overflow-hidden bg-slate-100">
                    {imageFile ? (
                      <Image src={URL.createObjectURL(imageFile)} alt="Preview" fill className="object-cover" />
                    ) : formData.image.startsWith('http') ? (
                      <Image src={formData.image} alt="Preview" fill className="object-cover" />
                    ) : null}
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImageFile(e.target.files[0]);
                      }
                    }}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Upload a JPG or PNG from your device.</p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Grilled Chicken"
              />
            </div>

            <div>
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                value={formData.desc}
                onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                placeholder="Item description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (₦)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="15000"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories.length > 0 ? categories.map((cat) => cat.name) : ['Asun', 'Chicken', 'Fish', 'Beef', 'Turkey', 'Soup', 'Sides', 'Drinks']).map((categoryName) => (
                      <SelectItem key={categoryName} value={categoryName}>
                        {categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="badge">Badge (Optional)</Label>
                <Input
                  id="badge"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g. Best Seller"
                />
              </div>
              <div>
                <Label htmlFor="rating">Rating</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  max="5"
                  min="0"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveItem}
                disabled={isSaving || uploadingImage}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingItem ? 'Update Item' : 'Add Item'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
