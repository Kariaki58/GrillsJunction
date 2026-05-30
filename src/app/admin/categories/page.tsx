'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit2, Trash2, Plus, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

interface Category {
  id: number;
  name: string;
  image: string | null;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({ name: '', image: '' });

  const supabase = createClient();
  const { toast } = useToast();

  const fetchCategories = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('categories').select('*').order('id', { ascending: true });
    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch categories.', variant: 'destructive' });
      setCategories([]);
    } else {
      setCategories(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryImageFile(null);
    setFormData({ name: '', image: '' });
    setDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryImageFile(null);
    setFormData({ name: category.name, image: category.image || '' });
    setDialogOpen(true);
  };

  const uploadCategoryImage = async (file: File): Promise<string | null> => {
    setUploadingImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `categories/${fileName}`;

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

  const handleSaveCategory = async () => {
    setIsSaving(true);
    let imageUrl = formData.image;

    if (categoryImageFile) {
      const uploadedUrl = await uploadCategoryImage(categoryImageFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        setIsSaving(false);
        return;
      }
    }

    const categoryToSave = {
      name: formData.name.trim(),
      image: imageUrl,
    };

    if (!categoryToSave.name) {
      toast({ title: 'Validation Error', description: 'Category name is required.', variant: 'destructive' });
      setIsSaving(false);
      return;
    }

    if (editingCategory) {
      const { error } = await supabase.from('categories').update(categoryToSave).eq('id', editingCategory.id);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Category updated successfully.' });
        fetchCategories();
        setDialogOpen(false);
      }
    } else {
      const { error } = await supabase.from('categories').insert([categoryToSave]);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Category created successfully.' });
        fetchCategories();
        setDialogOpen(false);
      }
    }

    setIsSaving(false);
  };

  const handleDeleteCategory = async (id: number) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Category deleted.' });
      fetchCategories();
    }
  };

  const getCategoryImageSrc = (image: string | null) => {
    if (!image) {
      return PlaceHolderImages[0]?.imageUrl || '/placeholder.png';
    }

    if (image.startsWith('http')) {
      return image;
    }

    return PlaceHolderImages.find((i) => i.id === image)?.imageUrl || PlaceHolderImages[0]?.imageUrl || '/placeholder.png';
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Category Library</CardTitle>
              <CardDescription>Manage category labels and featured images for the storefront</CardDescription>
            </div>
            <Button onClick={handleAddCategory} className="gap-2 bg-gradient-to-r from-sky-500 to-blue-600">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-20 text-center flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : categories.length === 0 ? (
            <div className="py-12 text-center text-slate-600">No categories created yet. Add one to start organizing your menu.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        {category.image ? (
                          <Image src={getCategoryImageSrc(category.image)} alt={category.name} width={40} height={40} className="rounded-md object-cover h-10 w-10" />
                        ) : (
                          <div className="h-10 w-10 bg-slate-100 flex items-center justify-center rounded-md text-xs text-slate-400">
                            No Img
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{category.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => handleEditCategory(category)}>
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
                                <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCategory(category.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md md:max-w-lg overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="category-image">Category Image</Label>
              <div className="mt-2 flex items-center gap-4">
                {(categoryImageFile || formData.image) && (
                  <div className="relative h-16 w-16 rounded-md overflow-hidden bg-slate-100">
                    {categoryImageFile ? (
                      <Image src={URL.createObjectURL(categoryImageFile)} alt="Preview" fill className="object-cover" />
                    ) : formData.image.startsWith('http') ? (
                      <Image src={formData.image} alt="Preview" fill className="object-cover" />
                    ) : null}
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="category-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setCategoryImageFile(e.target.files[0]);
                      }
                    }}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Upload a JPG or PNG that represents this category.</p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Asun"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveCategory}
                disabled={isSaving || uploadingImage}
                className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600"
              >
                {isSaving ? 'Saving...' : editingCategory ? 'Update Category' : 'Add Category'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
