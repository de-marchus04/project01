"use client";
import { uploadImageToCloud } from "@/shared/api/uploadApi";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBeginnersCourses, getBackCourses, getMeditationCourses, getWomenCourses, getCourseById, getAllAdminCourses, addCourse, updateCourse, deleteCourse } from "@/shared/api/courseApi";
import { getAllAdminConsultations, deleteConsultation, updateConsultation, addConsultation } from "@/shared/api/consultationApi";
import { getAllAdminArticles, getVideos, getPodcasts, getRecipes, deleteArticle, deleteVideo, deletePodcast, deleteRecipe, updateArticle, addArticle, updateVideo, addVideo, updatePodcast, addPodcast, updateRecipe, addRecipe } from "@/shared/api/blogApi";
import { getTours, deleteTour, updateTour, addTour } from "@/shared/api/tourApi";
import type { Tour } from "@/entities/tour/model/types";
import { getOrders, updateOrderStatus, deleteOrder, Order } from "@/shared/api/userApi";
import { Course } from "@/entities/course/model/types";
import type { Consultation } from "@/entities/consultation/model/types";
import { Article } from "@/entities/blog/model/types";
import { emailService } from "@/shared/api/emailService";
import { getMessages, replyToMessage, deleteMessage, SupportMessage } from "@/shared/api/supportApi";
import { getTestimonials, addTestimonial, updateTestimonial, deleteTestimonial, Testimonial } from "@/shared/api/testimonialApi";
import { getFAQs, addFAQ, updateFAQ, deleteFAQ, FAQ } from "@/shared/api/faqApi";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import { useTheme } from "@/shared/i18n/ThemeContext";
import { formatPrice } from "@/shared/lib/formatPrice";
import { bulkUpdateAuthor } from "@/shared/api/adminApi";
import { changePassword, getMyProfile, updateMyProfile } from "@/shared/api/authActions";
import { modalService } from "@/shared/ui/Modal/modalService";
import { useSession, signOut } from "next-auth/react";

export default function Admin() {
  const { lang, t } = useLanguage();
  const { theme } = useTheme();
  const { data: session, status, update } = useSession();

  const translateStatus = (s: string) => {
    if (s === 'В обработке') return t.admin.statusProcessing;
    if (s === 'Принята') return t.admin.statusAccepted;
    if (s === 'Отклонена') return t.admin.statusRejected;
    return s;
  };
  const [activeTab, setActiveTab] = useState("coursesPane");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  
  const [stats, setStats] = useState({
    earnedTotal: 0,
    newRequests: 0,
    popularService: t.admin.noData
  });

  useEffect(() => {
    let earned = 0;
    let newReqs = 0;
    const serviceCounts: Record<string, number> = {};

    orders.forEach(order => {
      if (order.status === 'Принята') {
        earned += order.price;
      }
      if (order.status === 'В обработке') {
        newReqs++;
      }
      if (order.productName) {
        serviceCounts[order.productName] = (serviceCounts[order.productName] || 0) + 1;
      }
    });

    let maxCount = 0;
    let popular = t.admin.noData;
    for (const [name, count] of Object.entries(serviceCounts)) {
      if (count > maxCount) {
        maxCount = count;
        popular = name;
      }
    }

    setStats({
      earnedTotal: earned,
      newRequests: newReqs,
      popularService: popular
    });
  }, [orders]);

  const [editingItem, setEditingItem] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isProfileEdited, setIsProfileEdited] = useState(false);
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  const [adminProfile, setAdminProfile] = useState({
    name: '',
    email: '',
    phone: '',
    photoUrl: ''
  });

  const router = useRouter();

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = async () => {
    try {
      const [coursesData, consultationsData, articlesData, toursData, ordersData, videosData, podcastsData, recipesData, testimonialsData] = await Promise.all([
        getAllAdminCourses(),
        getAllAdminConsultations(),
        getAllAdminArticles(),
        getTours(),
        getOrders(),
        getVideos(),
        getPodcasts(),
        getRecipes(),
        getTestimonials()
      ]);
      setCourses(coursesData);
      setConsultations(consultationsData);
      setArticles(articlesData);
      setVideos(videosData);
      setPodcasts(podcastsData);
      setRecipes(recipesData);
      setTours(toursData);
      setOrders(ordersData);
      getMessages().then(setSupportMessages);
      getFAQs().then(setFaqs);
      setTestimonials(testimonialsData);
    } catch (error) {
      console.error("Error loading admin data:", error);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    const role = (session?.user as any)?.role;
    const username = (session?.user as any)?.username;
    if (role !== 'ADMIN') {
      router.push('/profile');
      return;
    }
    getMyProfile(username).then(profile => {
      if (profile) {
        setAdminProfile({
          name: profile.name || profile.username,
          email: profile.email || '',
          phone: profile.phone || '',
          photoUrl: profile.avatar || ''
        });
      }
    });
    loadData();
  }, [status, session, router]);

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;
    
    const username = (session?.user as any)?.username || 'admin';
    
    const res = await changePassword(username, oldPassword, newPassword);
    if (res.success) {
      setIsPasswordChanged(true);
      setPasswordError(null);
      setOldPassword("");
      setNewPassword("");
      setTimeout(() => setIsPasswordChanged(false), 3000);
    } else {
      setPasswordError(res.error || t.admin.errPasswordChange);
    }
  };

  const handleProfileSave = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    
    if (!adminProfile.name || !adminProfile.photoUrl || adminProfile.name.trim() === '' || adminProfile.photoUrl.trim() === '') {
      showToast(t.admin.reqFields, 'error');
      return;
    }

    try {
      const username = (session?.user as any)?.username || 'admin';

      const oldProfile = await getMyProfile(username);
      let oldAuthorName = 'Админ сайта';
      if (oldProfile?.name) {
        oldAuthorName = `${oldProfile.name} (Админ сайта)`;
      }

      await updateMyProfile(username, {
        name: adminProfile.name,
        email: adminProfile.email,
        phone: adminProfile.phone,
        avatar: adminProfile.photoUrl
      });

      // Refresh the JWT session so the header reflects the new name/avatar immediately
      await update();
      window.dispatchEvent(new CustomEvent('profile_updated'));

      const authorName = `${adminProfile.name} (Админ сайта)`;
      await bulkUpdateAuthor(authorName, adminProfile.photoUrl, oldAuthorName);

      setIsProfileEdited(false);
      setIsProfileSaved(true);
      setTimeout(() => setIsProfileSaved(false), 3000);
      showToast(t.admin.profileSaved, 'success');
    } catch (error) {
      console.error("Error saving profile:", error);
      showToast(t.admin.errSaveImg, 'error');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          uploadImageToCloud(dataUrl).then(cloudUrl => {
            setAdminProfile(prev => ({ ...prev, photoUrl: cloudUrl }));
            setIsProfileEdited(true);
          }).catch(err => {
            console.error('Cloudinary fallback', err);
            setAdminProfile(prev => ({ ...prev, photoUrl: dataUrl }));
            setIsProfileEdited(true);
          });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          // Show a minor visual feedback placeholder on the input if we want, but letting the promise resolve is ok
          const input = document.getElementById('mainImageUrlInput') as HTMLInputElement;
          if (input) {
            input.value = t.admin.uploading;
          }
          uploadImageToCloud(dataUrl).then(cloudUrl => {
             if (input) input.value = cloudUrl;
          }).catch(err => {
             console.error('Cloudinary fallback', err);
             if (input) input.value = dataUrl;
          });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddForm = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const openEditForm = (item: any) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setEditingItem(null);
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string, type: string) => {
    if (!(await modalService.confirm("", t.admin.confirmDel))) return;
    
    try {
      if (type === 'course') await deleteCourse(id);
      if (type === 'consultation') await deleteConsultation(id);
      if (type === 'article') await deleteArticle(id);
      if (type === 'video') await deleteVideo(id);
      if (type === 'podcast') await deletePodcast(id);
      if (type === 'recipe') await deleteRecipe(id);
      if (type === 'tour') await deleteTour(id);
      if (type === 'faq') await deleteFAQ(id);
      if (type === 'testimonial') await deleteTestimonial(id);
      await loadData();
    } catch (error) {
      console.error(error);
      await modalService.alert("", t.admin.errDel);
    }
  };

  const handleOrderStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateOrderStatus(id, newStatus);
      await loadData();
    } catch (error) {
      console.error(error);
      await modalService.alert("", t.admin.errUpdateStatus);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (await modalService.confirm("", t.admin.confirmDelOrder)) {
      try {
        await deleteOrder(id);
        await loadData();
      } catch (error) {
        console.error(error);
        await modalService.alert("", t.admin.errDelOrder);
      }
    }
  };


  const translateText = async (text: string, toLang: string) => {
    if (!text || typeof text !== 'string') return text;
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ru|${toLang}`);
      const data = await res.json();
      if (data && data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText;
      }
    } catch (e) {
      console.error(e);
    }
    return text;
  };

  const translateObjectFields = async (obj: any) => {
    const fieldsToTranslate = ['title', 'description', 'subtitle', 'content', 'fullDescription', 'features', 'question', 'answer', 'location'];
    const translations: any = { en: {}, uk: {} };
    let hasText = false;
    for (const field of fieldsToTranslate) {
      if (obj[field]) {
         hasText = true;
         translations.en[field] = await translateText(obj[field], 'en');
         translations.uk[field] = await translateText(obj[field], 'uk');
      }
    }
    return hasText ? { ...obj, translations } : obj;
  };


  const handleSave = async (e: React.FormEvent) => {


    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries()) as any;
    
    try {
      let authorName = adminProfile.name ? `${adminProfile.name} (Админ сайта)` : ((session?.user as any)?.username ? `${(session?.user as any).username} (Админ сайта)` : 'Админ сайта');
      let authorPhoto = adminProfile.photoUrl || '';

      if (activeTab === 'coursesPane') {
        const courseData = await translateObjectFields({ title: data.title, description: data.description, fullDescription: data.fullDescription, features: data.features, price: Number(data.price), imageUrl: data.imageUrl, author: authorName, authorPhoto });
        if (editingItem) await updateCourse(editingItem.id, courseData);
        else await addCourse(courseData, data.category || 'beginners');
      } 
      else if (activeTab === 'consultationsPane') {
        const consultationData = await translateObjectFields({ title: data.title, description: data.description, fullDescription: data.fullDescription, features: data.features, price: Number(data.price), imageUrl: data.imageUrl, author: authorName, authorPhoto });
        if (editingItem) await updateConsultation(editingItem.id, consultationData);
        else await addConsultation(consultationData, data.category || 'private');
      }
      else if (activeTab === 'articlesPane') {
        const articleData = await translateObjectFields({ title: data.title, subtitle: data.subtitle, imageUrl: data.imageUrl, author: authorName, authorPhoto, tag: data.tag, content: data.content });
        if (editingItem) {
          await updateArticle(editingItem.id, articleData);
        } else {
          await addArticle(articleData);
        }
      }
      else if (activeTab === 'toursPane') {
        const tourData = await translateObjectFields({ title: data.title, description: data.description, fullDescription: data.fullDescription, features: data.features, price: Number(data.price), imageUrl: data.imageUrl, date: data.date, location: data.location, author: authorName, authorPhoto });
        if (editingItem) await updateTour(editingItem.id, tourData);
        else await addTour(tourData);
      }
      else if (activeTab === 'faqsPane') {
        const faqData = await translateObjectFields({ question: data.title, answer: data.description });
        if (editingItem) await updateFAQ(editingItem.id, faqData);
        else await addFAQ(faqData);
      }
      else if (activeTab === 'testimonialsPane') {
        const testimonialData = await translateObjectFields({ name: data.title, course: data.course, text: data.description });
        if (editingItem) await updateTestimonial(editingItem.id, testimonialData);
        else await addTestimonial(testimonialData);
      }
      else if (activeTab === 'videosPane') {
        const videoData = await translateObjectFields({ title: data.title, description: data.description, videoUrl: data.videoUrl, thumbnailUrl: data.imageUrl, tag: data.tag });
        if (editingItem) await updateVideo(editingItem.id, videoData);
        else await addVideo(videoData);
      }
      else if (activeTab === 'podcastsPane') {
        const podcastData = await translateObjectFields({ title: data.title, description: data.description, audioUrl: data.audioUrl, duration: data.duration, tag: data.tag });
        if (editingItem) await updatePodcast(editingItem.id, podcastData);
        else await addPodcast(podcastData);
      }
      else if (activeTab === 'recipesPane') {
        const recipeData = await translateObjectFields({ title: data.title, description: data.description, fullDescription: data.fullDescription, imageUrl: data.imageUrl, time: data.time, tag: data.tag });
        if (editingItem) await updateRecipe(editingItem.id, recipeData);
        else await addRecipe(recipeData);
      }
      
      await loadData();
      showToast(t.admin.itemSaved, 'success');
      
      if (!editingItem) {
        closeForm();
      }
    } catch (error) {
      console.error(error);
      await modalService.alert('', t.admin.errSave);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderForm = () => {
    if (!isFormOpen) return null;

    return (
      <div className="card border-0 p-4 mb-4" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="h5 fw-bold mb-0" style={{ color: 'var(--color-text)' }}>{editingItem ? t.admin.modeEdit : t.admin.modeAdd}</h3>
          <button type="button" className="btn-close" onClick={closeForm}></button>
        </div>
        <form onSubmit={handleSave}>
          <div className="row g-3">
            <div className="col-md-12">
              <label className="form-label">{activeTab === 'faqsPane' ? t.admin.formQuestion : activeTab === 'testimonialsPane' ? t.admin.formUsername  : t.admin.formTitleLabel}</label>
              <input type="text" name="title" className="form-control" required defaultValue={activeTab === 'faqsPane' ? editingItem?.question || '' : activeTab === 'testimonialsPane' ? editingItem?.name || ''  : editingItem?.title || ''} />
            </div>
            
            {activeTab === 'articlesPane' && (
              <>
                <div className="col-md-12">
                  <label className="form-label">{t.admin.formSubtitle}</label>
                  <textarea name="subtitle" className="form-control" rows={2} required defaultValue={editingItem?.subtitle || ''}></textarea>
                </div>
                <div className="col-md-12">
                  <label className="form-label">{t.admin.formContent}</label>
                  <textarea name="content" className="form-control" rows={6} defaultValue={editingItem?.content || ''}></textarea>
                </div>
              </>
            )}

            {activeTab === 'testimonialsPane' && (<div className="col-md-12"><label className="form-label">{t.admin.formCourseLabel}</label><input type="text" name="course" className="form-control" required defaultValue={editingItem?.course || ''} /></div>)}{activeTab !== 'articlesPane' && (
              <div className="col-md-12">
                <label className="form-label">{activeTab === 'faqsPane' ? t.admin.formAnswer : activeTab === 'testimonialsPane' ? t.admin.formReview : t.admin.formDesc}</label>
                <textarea name="description" className="form-control" rows={3} required defaultValue={activeTab === 'faqsPane' ? editingItem?.answer || '' : activeTab === 'testimonialsPane' ? editingItem?.text || '' : editingItem?.description || ''}></textarea>
              </div>
            )}

            {['coursesPane', 'consultationsPane', 'toursPane'].includes(activeTab) && (
              <div className="col-md-6">
                <label className="form-label">{t.admin.formPrice} ({lang === 'en' ? '$' : '₴'})</label>
                <input type="number" name="price" className="form-control" required defaultValue={editingItem?.price || ''} />
              </div>
            )}

            {['videosPane', 'podcastsPane', 'recipesPane', 'articlesPane'].includes(activeTab) && (
              <div className="col-md-6">
                <label className="form-label">{t.admin.formTag}</label>
                <input type="text" name="tag" className="form-control" defaultValue={editingItem?.tag || ''} />
              </div>
            )}

            {activeTab === 'videosPane' && (
              <div className="col-md-6">
                <label className="form-label">{t.admin.formVideoUrl}</label>
                <input type="text" name="videoUrl" className="form-control" required defaultValue={editingItem?.videoUrl || ''} />
              </div>
            )}

            {activeTab === 'podcastsPane' && (
              <>
                <div className="col-md-6">
                  <label className="form-label">{t.admin.formAudioUrl}</label>
                  <input type="text" name="audioUrl" className="form-control" required defaultValue={editingItem?.audioUrl || ''} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">{t.admin.formDuration}</label>
                  <input type="text" name="duration" className="form-control" required defaultValue={editingItem?.duration || ''} />
                </div>
              </>
            )}

            {['recipesPane', 'coursesPane', 'consultationsPane', 'toursPane'].includes(activeTab) && (
              <div className="col-md-12">
                <label className="form-label">{activeTab === 'recipesPane' ? t.admin.formRecipeDesc : t.admin.formFullDesc}</label>
                <textarea name="fullDescription" className="form-control" rows={5} defaultValue={editingItem?.fullDescription || ''}></textarea>
              </div>
            )}
            
            {['coursesPane', 'consultationsPane', 'toursPane'].includes(activeTab) && (
              <div className="col-md-12">
                <label className="form-label">{t.admin.formFeatures}</label>
                <textarea name="features" className="form-control" rows={4} defaultValue={editingItem?.features || ''} placeholder={t.admin.formFeaturesPlaceholder}></textarea>
              </div>
            )}

            {activeTab === 'recipesPane' && (
              <div className="col-md-6">
                <label className="form-label">{t.admin.formTime}</label>
                <input type="text" name="time" className="form-control" required defaultValue={editingItem?.time || ''} />
              </div>
            )}

            {activeTab !== 'podcastsPane' && (
              <div className="col-md-6">
                <label className="form-label">{t.admin.formImageUrl} <span className="text-danger">*</span></label>
                <div className="d-flex gap-2">
                  <input type="text" id="mainImageUrlInput" name="imageUrl" className="form-control" required defaultValue={editingItem?.imageUrl || editingItem?.thumbnailUrl || ''} />
                  <label className="btn btn-outline-secondary text-nowrap d-flex align-items-center" style={{ cursor: 'pointer' }}>
                    <i className="bi bi-upload me-2"></i>{t.admin.formFromPc}
                    <input type="file" accept="image/*" className="d-none" onChange={handleMainImageUpload} />
                  </label>
                </div>
              </div>
            )}

            {!editingItem && activeTab === 'coursesPane' && (
              <div className="col-md-6">
                <label className="form-label">{t.admin.formCategory}</label>
                <select name="category" className="form-select">
                  <option value="beginners">{t.admin.catBeginners}</option>
                  <option value="back">{t.admin.catBack}</option>
                  <option value="meditation">{t.admin.catMeditation}</option>
                  <option value="women">{t.admin.catWomen}</option>
                </select>
              </div>
            )}

            {!editingItem && activeTab === 'consultationsPane' && (
              <div className="col-md-6">
                <label className="form-label">{t.admin.formCategory}</label>
                <select name="category" className="form-select">
                  <option value="private">{t.admin.catPrivate}</option>
                  <option value="nutrition">{t.admin.catNutrition}</option>
                  <option value="mentorship">{t.admin.catMentorship}</option>
                </select>
              </div>
            )}

            {activeTab === 'toursPane' && (
              <>
                <div className="col-md-6">
                  <label className="form-label">{t.admin.formDates}</label>
                  <input type="text" name="date" className="form-control" required defaultValue={editingItem?.date || ''} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">{t.admin.formLocation}</label>
                  <input type="text" name="location" className="form-control" required defaultValue={editingItem?.location || ''} />
                </div>
              </>
            )}

            <div className="col-12 mt-4">
              <button type="submit" className="btn px-4 rounded-pill" style={{ backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none' }} disabled={isSubmitting}>
                {isSubmitting ? t.admin.formSaving : t.admin.formSave}
              </button>
              <button type="button" className="btn ms-2 px-4 rounded-pill" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)', backgroundColor: 'transparent' }} onClick={closeForm}>
                {t.admin.formCancel}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  };

  const renderTable = (items: any[], type: string, columns: string[], renderRow: (item: any) => React.ReactNode) => (
    <section className="card border-0 p-4" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="h5 fw-bold mb-0" style={{ color: 'var(--color-text)' }}>{t.admin.manage}</h3>
        <button className="btn btn-sm px-3 rounded-pill" style={{ backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none' }} onClick={openAddForm}>
          <i className="bi bi-plus-lg"></i> {t.admin.addBtn}
        </button>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              {columns.map((col, i) => <th key={i}>{col}</th>)}
              <th className="text-end">{t.admin.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                {renderRow(item)}
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEditForm(item)}>{t.admin.btnEdit}</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id, type)}>{t.admin.btnDel}</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-4" style={{ color: 'var(--color-text-muted)' }}>{t.admin.noData}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  return (
    <main style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', paddingTop: '64px' }}>
      <div className="d-flex admin-layout" style={{ padding: '20px 16px 16px' }}>

        {/* SIDEBAR TOGGLE (always visible) */}
        <button
          className="admin-sidebar-toggle d-flex align-items-center justify-content-center"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? 'Скрыть меню' : 'Показать меню'}
          style={{
            position: 'fixed', top: '94px', left: sidebarOpen ? '276px' : '14px',
            zIndex: 1040, width: '42px', height: '42px', borderRadius: '50%',
            border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card-bg)',
            color: 'var(--color-text)', cursor: 'pointer', transition: 'left 0.3s ease',
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          }}
        >
          <i className={`bi ${sidebarOpen ? 'bi-chevron-left' : 'bi-list'}`} style={{ fontSize: '1.15rem' }}></i>
        </button>

        {/* LEFT SIDEBAR — compact card block */}
        <div style={{
          width: sidebarOpen ? '280px' : '0px',
          minWidth: sidebarOpen ? '280px' : '0px',
          overflow: 'hidden',
          transition: 'width 0.3s ease, min-width 0.3s ease',
          opacity: sidebarOpen ? 1 : 0,
          flexShrink: 0,
        }}>
          <div className="card border-0 shadow-sm rounded-4 sticky-top" style={{
            top: '90px',
            backgroundColor: 'var(--color-card-bg)',
            padding: '1.25rem 1rem',
            overflow: 'hidden',
          }}>
            {/* Logo */}
            <div className="d-flex align-items-center gap-2 mb-3 pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <div className="d-flex align-items-center justify-content-center" style={{
                width: '36px', height: '36px', borderRadius: '10px',
                backgroundColor: 'var(--color-primary)', color: '#fff', fontWeight: 700, fontSize: '0.85rem',
              }}>YL</div>
              <div>
                <div className="font-playfair fw-bold" style={{ fontSize: '1rem', color: 'var(--color-text)', lineHeight: 1.2 }}>YOGA.LIFE</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>admin panel</div>
              </div>
            </div>

            {/* Status badge */}
            <div className="mb-3">
              <span className="d-block text-center py-2 rounded-3" style={{
                fontSize: '0.8rem', fontWeight: 600,
                backgroundColor: isProfileSaved ? 'rgba(25,135,84,0.1)' : (isProfileEdited ? 'rgba(255,193,7,0.15)' : 'var(--color-secondary)'),
                color: isProfileSaved ? '#198754' : (isProfileEdited ? '#997404' : 'var(--color-text-muted)'),
                border: `1px solid ${isProfileSaved ? 'rgba(25,135,84,0.2)' : (isProfileEdited ? 'rgba(255,193,7,0.3)' : 'var(--color-border)')}`,
              }}>
                {isProfileSaved ? <><i className="bi bi-check2-circle me-1"></i>{t.admin.badgeSaved}</> : t.admin.titleAdmin}
              </span>
            </div>

            {/* Bento stats */}
            <div className="row g-2 mb-3">
              <div className="col-6">
                <div className="rounded-3 p-2 text-center" style={{ backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-border)' }}>
                  <div className="fw-bold" style={{ fontSize: '0.95rem', color: 'var(--color-primary)' }}>{formatPrice(stats.earnedTotal, lang)}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.admin.statEarnedFull}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="rounded-3 p-2 text-center" style={{ backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-border)' }}>
                  <div className="fw-bold" style={{ fontSize: '0.95rem', color: 'var(--color-primary)' }}>{stats.newRequests}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.admin.statNewReqFull}</div>
                </div>
              </div>
              <div className="col-12">
                <div className="rounded-3 p-2 text-center" style={{ backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-border)' }}>
                  <div className="fw-bold text-truncate" style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>{stats.popularService}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.admin.statPopService}</div>
                </div>
              </div>
            </div>

            {/* Section label */}
            <div className="mb-2" style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600, paddingLeft: '12px' }}>
              {t.admin.tabCourses ? 'Управление' : 'Management'}
            </div>

            {/* Nav items */}
            <nav className="d-flex flex-column gap-1">
              {([
                ['coursesPane', t.admin.tabCourses, 'bi-book'],
                ['consultationsPane', t.admin.tabConsult, 'bi-person-circle'],
                ['articlesPane', t.admin.tabBlog, 'bi-newspaper'],
                ['videosPane', t.admin.tabVideos, 'bi-play-circle'],
                ['podcastsPane', t.admin.tabPodcasts, 'bi-mic'],
                ['recipesPane', t.admin.tabRecipes, 'bi-egg-fried'],
                ['toursPane', t.admin.tabTours, 'bi-geo-alt'],
                ['ordersPane', t.admin.tabOrders, 'bi-clipboard-check'],
                ['supportPane', t.admin.tabSupport, 'bi-chat-dots'],
                ['faqsPane', t.admin.tabFaq, 'bi-question-circle'],
                ['testimonialsPane', t.admin.tabTestimonials, 'bi-star'],
                ['profilePane', t.admin.tabProfile, 'bi-person-gear'],
              ] as [string, string, string][]).map(([pane, label, icon]) => (
                <div
                  key={pane}
                  className="admin-nav-item"
                  onClick={() => { setActiveTab(pane); closeForm(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '9px 12px', borderRadius: '10px', cursor: 'pointer',
                    fontSize: '0.88rem', transition: 'all 0.2s ease', userSelect: 'none',
                    backgroundColor: activeTab === pane ? 'var(--color-primary)' : 'transparent',
                    color: activeTab === pane ? '#fff' : 'var(--color-text)',
                    fontWeight: activeTab === pane ? 600 : 400,
                  }}
                  onMouseEnter={(e) => { if (activeTab !== pane) e.currentTarget.style.backgroundColor = 'var(--color-secondary)'; }}
                  onMouseLeave={(e) => { if (activeTab !== pane) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <i className={`bi ${icon}`} style={{ fontSize: '1rem', width: '20px', textAlign: 'center' }}></i>
                  {label}
                </div>
              ))}
            </nav>

            {/* Logout button — like profile sidebar */}
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
              <button
                onClick={handleLogout}
                className="btn w-100 rounded-pill py-2"
                style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                {t.header?.logout || 'Выйти'}
              </button>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-grow-1 p-4" style={{ minHeight: 'calc(100vh - 64px)', overflowY: 'auto' }}>
          {renderForm()}

          {activeTab === 'coursesPane' && !isFormOpen && renderTable(
            courses, 'course', ['ID', t.admin.colTitle, t.admin.colPrice],
            (item) => (<><td>{item.id}</td><td>{item.title}</td><td>{formatPrice(item.price, lang)}</td></>)
          )}

          {activeTab === 'consultationsPane' && !isFormOpen && renderTable(
            consultations, 'consultation', ['ID', t.admin.colTitle, t.admin.colPrice],
            (item) => (<><td>{item.id}</td><td>{item.title}</td><td>{formatPrice(item.price, lang)}</td></>)
          )}

          {activeTab === 'articlesPane' && !isFormOpen && renderTable(
            articles, 'article', ['ID', t.admin.colTitle2, t.admin.colTag, t.admin.colDate],
            (item) => (<><td>{item.id}</td><td>{item.title}</td><td>{item.tag || '-'}</td><td>{new Date(item.createdAt).toLocaleDateString()}</td></>)
          )}

          {activeTab === 'videosPane' && !isFormOpen && renderTable(
            videos, 'video', ['ID', t.admin.colTitle, t.admin.colTag],
            (item) => (<><td>{item.id}</td><td>{item.title}</td><td>{item.tag || '-'}</td></>)
          )}

          {activeTab === 'podcastsPane' && !isFormOpen && renderTable(
            podcasts, 'podcast', ['ID', t.admin.colTitle, t.admin.colTag, t.admin.colDuration],
            (item) => (<><td>{item.id}</td><td>{item.title}</td><td>{item.tag || '-'}</td><td>{item.duration}</td></>)
          )}

          {activeTab === 'recipesPane' && !isFormOpen && renderTable(
            recipes, 'recipe', ['ID', t.admin.colTitle, t.admin.colTag, t.admin.colTime],
            (item) => (<><td>{item.id}</td><td>{item.title}</td><td>{item.tag || '-'}</td><td>{item.time}</td></>)
          )}

          {activeTab === 'toursPane' && !isFormOpen && renderTable(
            tours, 'tour', ['ID', t.admin.colTitle, t.admin.colDates, t.admin.colLocation, t.admin.colPrice],
            (item) => (<><td>{item.id}</td><td>{item.title}</td><td>{item.date}</td><td>{item.location}</td><td>{formatPrice(item.price, lang)}</td></>)
          )}

          {activeTab === 'faqsPane' && !isFormOpen && renderTable(
            faqs, 'faq', ['ID', t.admin.colQuestion, t.admin.colAnswer],
            (item) => (<><td>{item.id}</td><td>{item.question}</td><td className="text-truncate" style={{maxWidth: '200px'}}>{item.answer}</td></>)
          )}
          {activeTab === 'testimonialsPane' && !isFormOpen && renderTable(
            testimonials, 'testimonial', ['ID', t.admin.colName, t.admin.colCourse, t.admin.colReview],
            (item) => (<><td>{item.id}</td><td>{item.name}</td><td>{item.course}</td><td className="text-truncate" style={{maxWidth: '200px'}}>{item.text}</td></>)
          )}


          {activeTab === 'ordersPane' && !isFormOpen && (
            <section className="card border-0 p-4" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
                <h3 className="h5 fw-bold mb-4" style={{ color: 'var(--color-text)' }}>{t.admin.inRequests}</h3>
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>ID</th>
                                <th>{t.admin.colDate}</th>
                                <th>{t.admin.colClient}</th>
                                <th>{t.admin.colProduct}</th>
                                <th>{t.admin.colAmount}</th>
                                <th>{t.admin.colStatus}</th>
                                <th className="text-end">{t.admin.colActions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td>{order.id}</td>
                                    <td>{order.date}</td>
                                    <td>
                                      {order.customerName || t.admin.unknownClient}
                                      {order.userId && <span className="badge bg-light ms-2 border" style={{ color: 'var(--color-text)' }}>{t.admin.colRegistered}</span>}
                                      {!order.userId && <span className="badge bg-light ms-2 border" style={{ color: 'var(--color-text-muted)' }}>{t.admin.colGuest}</span>}
                                    </td>
                                    <td>{order.productName}</td>
                                    <td>{formatPrice(order.price, lang)}</td>
                                    <td>
                                        <span className={`badge ${
                                          order.status === 'Принята' ? 'bg-success' :
                                          order.status === 'Отклонена' ? 'bg-danger' :
                                          'bg-warning text-dark'
                                        }`}>
                                            {translateStatus(order.status)}
                                        </span>
                                    </td>
                                    <td className="text-end">
                                        <select
                                            className="form-select form-select-sm d-inline-block w-auto me-2"
                                            value={order.status}
                                            onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                                        >
                                            <option value="В обработке">{t.admin.statusProcessing}</option>
                                            <option value="Принята">{t.admin.statusAcceptLabel}</option>
                                            <option value="Отклонена">{t.admin.statusRejectLabel}</option>
                                        </select>
                                        {(order.status === 'Принята' || order.status === 'Отклонена') && (
                                            <button
                                                className="btn btn-sm btn-outline-danger border-0"
                                                onClick={() => handleDeleteOrder(order.id)}
                                                title={t.admin.deleteOrderTitle}
                                                style={{ transition: 'all 0.3s ease' }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#dc3545';
                                                    e.currentTarget.style.color = 'white';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                    e.currentTarget.style.color = '#dc3545';
                                                }}
                                            >
                                                <i className="bi bi-x-lg"></i>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr><td colSpan={6} className="text-center py-4" style={{ color: 'var(--color-text-muted)' }}>{t.admin.noOrders}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
          )}

          {activeTab === 'supportPane' && !isFormOpen && (
            <section className="card border-0 p-4" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
                <h3 className="h5 fw-bold mb-4" style={{ color: 'var(--color-text)' }}>{t.admin.supportMessages}</h3>
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>{t.admin.colDate}</th>
                                <th>{t.admin.colUser}</th>
                                <th>{t.admin.colQuestion}</th>
                                <th>{t.admin.colStatus}</th>
                                <th>{t.admin.colActions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {supportMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(msg => (
                                <tr key={msg.id}>
                                    <td>{new Date(msg.createdAt).toLocaleString()}</td>
                                    <td>
                                      <div><strong>{msg.userName}</strong></div>
                                      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85em' }}>{msg.userEmail}</div>
                                    </td>
                                    <td style={{ maxWidth: '300px' }}>
                                      <div className="fw-bold small text-primary mb-1">{msg.questionType}</div>
                                      <div className="text-truncate" title={msg.message}>{msg.message}</div>
                                      {msg.reply && (
                                        <div className="mt-2 p-2 rounded small" style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-text)' }}>
                                          <strong>{t.admin.supportReplyLabel}</strong> {msg.reply}
                                        </div>
                                      )}
                                    </td>
                                    <td>
                                        <span className={`badge ${msg.status === 'new' ? 'bg-danger' : msg.status === 'replied' ? 'bg-success' : 'bg-secondary'}`}>
                                            {msg.status === 'new' ? t.admin.supportNewStatus : msg.status === 'replied' ? t.admin.supportRepliedStatus : t.admin.supportBotStatus}
                                        </span>
                                    </td>
                                    <td>
                                        {msg.status === 'new' && (
                                          <div className="d-flex flex-column gap-2">
                                            <textarea
                                              className="form-control form-control-sm"
                                              rows={2}
                                              placeholder={t.admin.supportReplyPlaceholder}
                                              value={replyText[msg.id] || ''}
                                              onChange={(e) => setReplyText({...replyText, [msg.id]: e.target.value})}
                                            />
                                            <button
                                              className="btn btn-sm rounded-pill"
                                              style={{ backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none' }}
                                              onClick={async () => {
                                                if (!replyText[msg.id]) return;
                                                await replyToMessage(msg.id, replyText[msg.id]);
                                                getMessages().then(setSupportMessages);
                                                setReplyText({...replyText, [msg.id]: ''});
                                              }}
                                            >
                                              {t.common.send}
                                            </button>
                                          </div>
                                        )}
                                        {msg.status !== 'new' && (
                                          <button
                                            className="btn btn-sm btn-outline-danger mt-2 w-100"
                                            onClick={async () => {
                                              const confirmed = await modalService.confirm(
                                                t.admin.deleteMsgTitle,
                                                t.admin.deleteMsgConfirm,
                                                t.common.delete,
                                                t.common.cancel
                                              );
                                              if (confirmed) {
                                                await deleteMessage(msg.id);
                                                getMessages().then(setSupportMessages);
                                              }
                                            }}
                                          >
                                            {t.common.delete}
                                          </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {supportMessages.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-4" style={{ color: 'var(--color-text-muted)' }}>{t.admin.noMessages}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
          )}


          {activeTab === 'mediaPane' && !isFormOpen && (
            <section className="card border-0 p-4" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="h5 fw-bold mb-0">{t.admin.mediaManage}</h3>
                  <button className="btn btn-dark btn-sm px-3 rounded-pill" onClick={() => modalService.alert('', 'Функция загрузки медиа в разработке')}>
                    <i className="bi bi-cloud-upload"></i> Загрузить медиа
                  </button>
                </div>
                <div className="alert alert-info border-0 rounded-4" style={{ backgroundColor: '#e8f4f8', color: '#0c5460' }}>
                  <i className="bi bi-info-circle me-2"></i>
                  Здесь вы можете загружать изображения и видео-анимации для использования в слайдерах (Hero-блоках) на страницах курсов, туров, консультаций и блога.
                </div>
                <div className="row g-3 mt-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="col-md-3 col-sm-6">
                      <div className="card border-0 shadow-sm rounded-4 overflow-hidden position-relative group-hover">
                        <div style={{ height: '150px', backgroundColor: '#e9ecef', backgroundImage: `url('https://images.unsplash.com/photo-${1500000000000 + i * 1000000}?q=80&w=300')`, backgroundSize: 'cover', backgroundPosition: 'center' }} className="d-flex align-items-center justify-content-center text-muted">
                        </div>
                        <div className="card-body p-2 d-flex justify-content-between align-items-center">
                          <small className="text-muted text-truncate" style={{ maxWidth: '80%' }}>hero_bg_${i}.jpg</small>
                          <button className="btn btn-link text-danger p-0"><i className="bi bi-trash"></i></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            </section>
          )}

          {activeTab === 'siteContentPane' && !isFormOpen && (
            <section className="card border-0 p-4" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h3 className="h5 fw-bold mb-0">{t.admin.contentManage}</h3>
                </div>
                <div className="alert alert-info border-0 rounded-4" style={{ backgroundColor: '#e8f4f8', color: '#0c5460' }}>
                  <i className="bi bi-info-circle me-2"></i>
                  В этом разделе вы можете редактировать текстовое и визуальное содержимое основных страниц сайта.
                </div>
              <div className="text-center py-5 text-muted">
                <i className="bi bi-tools display-4 d-block mb-3"></i>
                <p>Раздел находится в разработке. В будущем здесь появится возможность редактировать контент всех страниц сайта.</p>
              </div>
            </section>
          )}

          {activeTab === 'profilePane' && !isFormOpen && (
            <section className="card border-0 p-4" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="h5 fw-bold mb-0" style={{ color: 'var(--color-text)' }}>{t.admin.profileManage}</h3>
              </div>
              <div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">{t.admin.profileName} <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" value={adminProfile.name} onChange={(e) => { setAdminProfile({...adminProfile, name: e.target.value}); setIsProfileEdited(true); }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">{t.admin.profileEmail}</label>
                    <input type="email" className="form-control" value={adminProfile.email} onChange={(e) => { setAdminProfile({...adminProfile, email: e.target.value}); setIsProfileEdited(true); }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">{t.admin.profilePhone}</label>
                    <input type="tel" className="form-control" value={adminProfile.phone} onChange={(e) => { setAdminProfile({...adminProfile, phone: e.target.value}); setIsProfileEdited(true); }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">{t.admin.profilePhoto} <span className="text-danger">*</span></label>
                    <div className="d-flex gap-2">
                      <input type="text" className="form-control" placeholder={t.admin.profilePhotoPlaceholder} value={adminProfile.photoUrl} onChange={(e) => { setAdminProfile({...adminProfile, photoUrl: e.target.value}); setIsProfileEdited(true); }} />
                      <label className="btn btn-outline-secondary text-nowrap d-flex align-items-center" style={{ cursor: 'pointer' }}>
                        <i className="bi bi-upload me-2"></i>{t.admin.profileFromPc}
                        <input type="file" accept="image/*" className="d-none" onChange={handleImageUpload} />
                      </label>
                    </div>
                  </div>
                  <div className="col-12 mt-4 d-flex align-items-center gap-3">
                    <button type="button" onClick={handleProfileSave} className="btn px-4 rounded-pill" style={{ backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none' }}>{t.admin.btnSaveProfile}</button>
                    {isProfileSaved && (
                      <div className="d-flex align-items-center fw-medium" style={{ color: '#198754', animation: 'fadeIn 0.3s ease' }}>
                        <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                        {t.admin.profileChangesApplied}
                      </div>
                    )}

                <hr className="my-5" />
                <h5 className="fw-bold mb-4" style={{ color: 'var(--color-text)' }}>{t.admin.profileChangePassword}</h5>
                <form onSubmit={handlePasswordChange}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">{t.admin.profileCurrentPass}</label>
                      <input type="password" className="form-control" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">{t.admin.profileNewPass}</label>
                      <input type="password" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    </div>
                    <div className="col-12 mt-4 d-flex align-items-center gap-3">
                      <button type="submit" className="btn rounded-pill px-4" style={{ border: '2px solid var(--color-primary)', color: 'var(--color-primary)', backgroundColor: 'transparent' }}>{t.admin.profileChangeBtn}</button>
                      {isPasswordChanged && (
                        <div className="fw-medium" style={{ color: '#198754' }}><i className="bi bi-check-circle-fill me-2"></i>{t.admin.profilePassChanged}</div>
                      )}
                      {passwordError && (
                        <div className="fw-medium" style={{ color: '#dc3545' }}><i className="bi bi-exclamation-circle-fill me-2"></i>{passwordError}</div>
                      )}
                    </div>
                  </div>
                </form>

                  </div>
                </div>
              </div>
            </section>
          )}

        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="position-fixed bottom-0 end-0 p-4" style={{ zIndex: 1050 }}>
          <div className="toast show align-items-center border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true"
            style={{
              borderRadius: '16px',
              backgroundColor: toastType === 'error' ? '#dc3545' : 'var(--color-primary)',
              color: '#fff',
            }}>
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center" style={{ fontSize: '0.95rem' }}>
                <i className={`bi ${toastType === 'error' ? 'bi-exclamation-circle-fill' : 'bi-check-circle-fill'} me-3`} style={{ fontSize: '1.2rem' }}></i>
                {toastMessage}
              </div>
              <button type="button" className="btn-close btn-close-white me-3 m-auto" onClick={() => setToastMessage(null)} aria-label="Close"></button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
