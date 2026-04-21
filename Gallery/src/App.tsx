'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import styles from './Gallery.module.css';

interface ImageItem {
  id: number;
  url: string;
  category: 'Nature' | 'City' | 'Food';
  subcategory: string;
  description: string;
}

const GALLERY_STORAGE_KEY = 'photoGalleryImages';

const Gallery: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(GALLERY_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved images', e);
        }
      }
    }
    // Default sample images
    return [
      { id: 1, url: 'https://picsum.photos/id/1015/600/400', category: 'Nature', subcategory: 'Mountains', description: 'Snowy mountain peak at sunrise' },
      { id: 2, url: 'https://picsum.photos/id/1016/600/400', category: 'Nature', subcategory: 'Forests', description: 'Misty forest trail' },
      { id: 3, url: 'https://picsum.photos/id/106/600/400', category: 'City', subcategory: 'Architecture', description: 'Modern skyscrapers' },
      { id: 4, url: 'https://picsum.photos/id/201/600/400', category: 'City', subcategory: 'Streets', description: 'Busy downtown street' },
      { id: 5, url: 'https://picsum.photos/id/292/600/400', category: 'Food', subcategory: 'Desserts', description: 'Delicious chocolate lava cake' },
      { id: 6, url: 'https://picsum.photos/id/431/600/400', category: 'Food', subcategory: 'Street Food', description: 'Fresh tacos al pastor' },
    ];
  });

  const [activeCategory, setActiveCategory] = useState<'All' | 'Nature' | 'City' | 'Food'>('All');
  const [activeSubcategory, setActiveSubcategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewerImage, setViewerImage] = useState<ImageItem | null>(null);
  const [imageToDelete, setImageToDelete] = useState<ImageItem | null>(null); // For confirmation

  const [newImage, setNewImage] = useState({
    url: '',
    category: 'Nature' as 'Nature' | 'City' | 'Food',
    subcategory: 'Mountains',
    description: '',
  });

  const subcategories: Record<'Nature' | 'City' | 'Food', string[]> = {
    Nature: ['Mountains', 'Forests', 'Oceans', 'Wildlife'],
    City: ['Architecture', 'Streets', 'Night City', 'Landmarks'],
    Food: ['Desserts', 'Street Food', 'Seafood', 'Asian Cuisine'],
  };

  const mainCategories: ('All' | 'Nature' | 'City' | 'Food')[] = ['All', 'Nature', 'City', 'Food'];

  const filteredImages = images.filter((img) => {
    const categoryMatch = activeCategory === 'All' || img.category === activeCategory;
    const subcategoryMatch = activeSubcategory === 'All' || img.subcategory === activeSubcategory;
    return categoryMatch && subcategoryMatch;
  });

  // Save to localStorage whenever images change
  useEffect(() => {
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(images));
  }, [images]);

  // Close viewer with Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewerImage) setViewerImage(null);
        if (imageToDelete) setImageToDelete(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [viewerImage, imageToDelete]);

  const handleCategoryChange = (cat: 'All' | 'Nature' | 'City' | 'Food') => {
    setActiveCategory(cat);
    setActiveSubcategory('All');
  };

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImage.url || !newImage.description) return;

    const image: ImageItem = {
      id: Date.now(),
      url: newImage.url,
      category: newImage.category,
      subcategory: newImage.subcategory,
      description: newImage.description,
    };

    setImages((prev) => [...prev, image]);
    setNewImage({ url: '', category: 'Nature', subcategory: 'Mountains', description: '' });
    setIsModalOpen(false);
  };

  const confirmDelete = (image: ImageItem) => {
    setImageToDelete(image);
  };

  const executeDelete = () => {
    if (imageToDelete) {
      setImages((prev) => prev.filter((img) => img.id !== imageToDelete.id));
      setImageToDelete(null);
    }
  };

  const cancelDelete = () => {
    setImageToDelete(null);
  };

  const currentSubcategories = subcategories[newImage.category];

  return (
    <div className={styles.galleryContainer}>
      <div className={styles.galleryWrapper}>
        {/* Header */}
        <div className={styles.galleryHeader}>
          <h1 className={styles.galleryTitle}>Photo Gallery</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className={styles.addButton}
          >
            <Plus size={20} />
            Add Photo
          </button>
        </div>

        {/* Main Category Tabs */}
        <div className={styles.mainTabs}>
          {mainCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`${styles.tabButton} ${activeCategory === cat ? styles.active : styles.inactive}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Subcategory Tabs */}
        {activeCategory !== 'All' && (
          <div className={styles.subTabs}>
            <button
              onClick={() => setActiveSubcategory('All')}
              className={`${styles.subTabButton} ${activeSubcategory === 'All' ? styles.active : styles.inactive}`}
            >
              All {activeCategory}
            </button>
            {subcategories[activeCategory].map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSubcategory(sub)}
                className={`${styles.subTabButton} ${activeSubcategory === sub ? styles.active : styles.inactive}`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* Gallery Grid */}
        {filteredImages.length === 0 ? (
          <div className={styles.emptyState}>
            <ImageIcon size={64} className={styles.emptyIcon} />
            <p className="text-xl">No images found in this category</p>
          </div>
        ) : (
          <div className={styles.galleryGrid}>
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className={styles.imageCard}
                onClick={() => setViewerImage(image)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.imageContainer}>
                  <img src={image.url} alt={image.description} />

                  {/* Subcategory Badge */}
                  <div className={styles.subcategoryBadge}>
                    {image.subcategory}
                  </div>

                  {/* Delete Button */}
                  <button
                    className={styles.deleteButton}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent opening viewer when deleting
                      confirmDelete(image);
                    }}
                    title="Delete photo"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className={styles.cardContent}>
                  <p className={styles.cardDescription}>
                    {image.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Photo Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add New Photo</h2>
              <button onClick={() => setIsModalOpen(false)} className={styles.closeButton}>
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handleAddImage} className="space-y-5">
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/image.jpg"
                  value={newImage.url}
                  onChange={(e) => setNewImage({ ...newImage, url: e.target.value })}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category</label>
                <select
                  value={newImage.category}
                  onChange={(e) => {
                    const newCat = e.target.value as 'Nature' | 'City' | 'Food';
                    setNewImage({
                      ...newImage,
                      category: newCat,
                      subcategory: subcategories[newCat][0],
                    });
                  }}
                  className={styles.formSelect}
                >
                  <option value="Nature">Nature</option>
                  <option value="City">City</option>
                  <option value="Food">Food</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Subcategory</label>
                <select
                  value={newImage.subcategory}
                  onChange={(e) => setNewImage({ ...newImage, subcategory: e.target.value })}
                  className={styles.formSelect}
                >
                  {currentSubcategories.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe this picture..."
                  value={newImage.description}
                  onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
                  className={styles.formTextarea}
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  Add to Gallery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewerImage && (
        <div className={styles.viewerOverlay} onClick={() => setViewerImage(null)}>
          <div className={styles.viewerContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeViewerButton} onClick={() => setViewerImage(null)}>
              <X size={24} />
            </button>

            <div className={styles.viewerImageContainer}>
              <img src={viewerImage.url} alt={viewerImage.description} className={styles.viewerImage} />
            </div>

            <div className={styles.viewerInfo}>
              <p className={styles.viewerTitle}>{viewerImage.description}</p>
              <p className={styles.viewerMeta}>
                {viewerImage.category} • {viewerImage.subcategory}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {imageToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '380px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Delete Photo?</h2>
              <button onClick={cancelDelete} className={styles.closeButton}>
                <X size={28} />
              </button>
            </div>

            <p style={{ marginBottom: '1.5rem', color: '#374151' }}>
              Are you sure you want to delete this photo? This action cannot be undone.
            </p>

            <div className={styles.formActions}>
              <button onClick={cancelDelete} className={styles.cancelButton}>
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className={styles.submitButton}
                style={{ backgroundColor: '#ef4444'}}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;