"use client";
import { uploadImageToCloud } from "@/shared/api/uploadApi";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBeginnersCourses, getBackCourses, getMeditationCourses, getWomenCourses, getCourseById, getAllAdminCourses, addCourse, updateCourse, deleteCourse } from "@/shared/api/courseApi";
import { getAllAdminConsultations, deleteConsultation, updateConsultation, addConsultation } from "@/shared/api/consultationApi";
import { getAllAdminArticles, getVideos, getPodcasts, getRecipes, deleteArticle, deleteVideo, deletePodcast, deleteRecipe, updateArticle, addArticle, updateVideo, addVideo, updatePodcast, addPodcast, updateRecipe, addRecipe } from "@/shared/api/blogApi";
import { getTours, deleteTour, updateTour, addTour, Tour } from "@/shared/api/tourApi";
import { getOrders, updateOrderStatus, deleteOrder, Order } from "@/shared/api/userApi";
import { Course } from "@/entities/course/model/types";
import { Article } from "@/entities/blog/model/types";
import { emailService } from "@/shared/api/emailService";
import { getMessages, replyToMessage, deleteMessage, SupportMessage } from "@/shared/api/supportApi";
import { getTestimonials, addTestimonial, updateTestimonial, deleteTestimonial, Testimonial } from "@/shared/api/testimonialApi";
import { getFAQs, addFAQ, updateFAQ, deleteFAQ, FAQ } from "@/shared/api/faqApi";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import { formatPrice } from "@/shared/lib/formatPrice";
import { modalService } from "@/shared/ui/Modal/modalService";

export default function Admin() {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState("coursesPane");
  const [courses, setCourses] = useState<Course[]>([]);
  const [consultations, setConsultations] = useState<Course[]>([]);
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
  const [isProfileEdited, setIsProfileEdited] = useState(false);
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  
  const [adminProfile, setAdminProfile] = useState({
    name: '',
    email: '',
    phone: '',
    photoUrl: ''
  });

  const router = useRouter();

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
    const userJson = localStorage.getItem('yoga_user');
    if (!userJson) {
      router.push('/login');
      return;
    }
    try {
      const userData = JSON.parse(userJson);
      if (userData.role !== 'admin' && userData.username !== 'admin') {
          router.push('/profile');
          return;
      }
      
      const savedProfile = localStorage.getItem(`profile_${userData.username}`);
      if (savedProfile) {
        setAdminProfile(JSON.parse(savedProfile));
      } else {
        setAdminProfile(prev => ({ ...prev, name: userData.username }));
      }
    } catch (e) {
      router.push('/login');
      return;
    }
    loadData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('yoga_user');
    window.location.href = '/';
  };

  const handleProfileSave = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    
    if (!adminProfile.name || !adminProfile.photoUrl || adminProfile.name.trim() === '' || adminProfile.photoUrl.trim() === '') {
      setToastMessage(t.admin.reqFields);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    try {
      const userJson = localStorage.getItem('yoga_user');
      const username = userJson ? JSON.parse(userJson).username : 'admin';
      
      // Получаем старый профиль, чтобы знать, какие статьи обновлять
      const oldProfileJson = localStorage.getItem(`profile_${username}`);
      let oldAuthorName = 'Админ сайта';
      if (oldProfileJson) {
        const oldProfile = JSON.parse(oldProfileJson);
        if (oldProfile.name) {
          oldAuthorName = `${oldProfile.name} (Админ сайта)`;
        }
      }
      
      localStorage.setItem(`profile_${username}`, JSON.stringify(adminProfile));
      
      // Обновляем все статьи, курсы, туры и консультации, где этот админ является автором
      // Это обеспечит обновление в реальном времени
      const authorName = `${adminProfile.name} (Админ сайта)`;
      
      // Обновляем статьи
      const articlesJson = localStorage.getItem('yoga_articles');
      if (articlesJson) {
        let articles = JSON.parse(articlesJson);
        let updated = false;
        articles = articles.map((a: any) => {
          if (!a.author || a.author === oldAuthorName || a.author === authorName || a.author === 'Админ сайта' || a.author.includes('Админ сайта')) {
            updated = true;
            return { ...a, author: authorName, authorPhoto: adminProfile.photoUrl };
          }
          return a;
        });
        if (updated) localStorage.setItem('yoga_articles', JSON.stringify(articles));
      }

      // Обновляем курсы
      const coursesJson = localStorage.getItem('yoga_courses');
      if (coursesJson) {
        let courses = JSON.parse(coursesJson);
        let updated = false;
        courses = courses.map((c: any) => {
          if (!c.author || c.author === oldAuthorName || c.author === authorName || c.author === 'Админ сайта' || c.author.includes('Админ сайта')) {
            updated = true;
            return { ...c, author: authorName, authorPhoto: adminProfile.photoUrl };
          }
          return c;
        });
        if (updated) localStorage.setItem('yoga_courses', JSON.stringify(courses));
      }

      // Обновляем туры
      const toursJson = localStorage.getItem('yoga_tours');
      if (toursJson) {
        let tours = JSON.parse(toursJson);
        let updated = false;
        tours = tours.map((t: any) => {
          if (!t.author || t.author === oldAuthorName || t.author === authorName || t.author === 'Админ сайта' || t.author.includes('Админ сайта')) {
            updated = true;
            return { ...t, author: authorName, authorPhoto: adminProfile.photoUrl };
          }
          return t;
        });
        if (updated) localStorage.setItem('yoga_tours', JSON.stringify(tours));
      }

      // Принудительно обновляем Header, вызывая событие storage
      window.dispatchEvent(new Event('storage'));

      setIsProfileEdited(false);
      setIsProfileSaved(true);
      setTimeout(() => setIsProfileSaved(false), 3000);

      setToastMessage(null);
      setTimeout(() => {
        setToastMessage(t.admin.profileSaved);
      }, 50);
      
      if ((window as any).profileToastTimeout) {
        clearTimeout((window as any).profileToastTimeout);
      }
      (window as any).profileToastTimeout = setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setToastMessage(t.admin.errSaveImg);
      setTimeout(() => setToastMessage(null), 3000);
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
            input.value = "Загрузка в облако. Ожидайте...";
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
      if (type === 'faq') deleteFAQ(id);
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
      const userJson = localStorage.getItem('yoga_user');
      let authorName = 'Админ сайта';
      let authorPhoto = '';
      if (userJson) {
        const userData = JSON.parse(userJson);
        const adminProfileJson = localStorage.getItem(`profile_${userData.username}`);
        if (adminProfileJson) {
          const adminProfile = JSON.parse(adminProfileJson);
          if (adminProfile.name) {
            authorName = `${adminProfile.name} (Админ сайта)`;
          }
          if (adminProfile.photoUrl) {
            authorPhoto = adminProfile.photoUrl;
          }
        } else {
          authorName = `${userData.username} (Админ сайта)`;
        }
      }

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
          
          // Симуляция автоматической рассылки подписчикам
          const subscribersJson = localStorage.getItem('yoga_subscribers');
          if (subscribersJson) {
            const subscribers = JSON.parse(subscribersJson);
            subscribers.forEach((email: string) => {
              emailService.sendEmail(
                email,
                `Новая статья в блоге YOGA.LIFE: ${articleData.title}`,
                `Здравствуйте! Мы опубликовали новую статью: "${articleData.title}".\n\n${articleData.subtitle}\n\nЧитайте на нашем сайте!`
              );
            });
            await modalService.alert('', t.admin.newsSent.replace('{count}', String(subscribers.length)));
          }
        }
      }
      else if (activeTab === 'toursPane') {
        const tourData = await translateObjectFields({ title: data.title, description: data.description, fullDescription: data.fullDescription, features: data.features, price: Number(data.price), imageUrl: data.imageUrl, date: data.date, location: data.location, author: authorName, authorPhoto });
        if (editingItem) await updateTour(editingItem.id, tourData);
        else await addTour(tourData);
      }
      else if (activeTab === 'faqsPane') {
        const faqData = await translateObjectFields({ question: data.title, answer: data.description });
        if (editingItem) updateFAQ(editingItem.id, faqData);
        else addFAQ(faqData);
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
      setToastMessage(t.admin.itemSaved);
      setTimeout(() => setToastMessage(null), 3000);
      
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
      <div className="card border-0 p-4 mb-4" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)', background: '#fff' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="h5 fw-bold mb-0">{editingItem ? 'Редактировать' : 'Добавить'}</h3>
          <button type="button" className="btn-close" onClick={closeForm}></button>
        </div>
        <form onSubmit={handleSave}>
          <div className="row g-3">
            <div className="col-md-12">
              <label className="form-label">{activeTab === 'faqsPane' ? 'Вопрос' : activeTab === 'testimonialsPane' ? 'Имя пользователя'  : 'Название / Заголовок'}</label>
              <input type="text" name="title" className="form-control" required defaultValue={activeTab === 'faqsPane' ? editingItem?.question || '' : activeTab === 'testimonialsPane' ? editingItem?.name || ''  : editingItem?.title || ''} />
            </div>
            
            {activeTab === 'articlesPane' && (
              <>
                <div className="col-md-12">
                  <label className="form-label">Подзаголовок</label>
                  <textarea name="subtitle" className="form-control" rows={2} required defaultValue={editingItem?.subtitle || ''}></textarea>
                </div>
                <div className="col-md-12">
                  <label className="form-label">Полный текст статьи</label>
                  <textarea name="content" className="form-control" rows={6} defaultValue={editingItem?.content || ''}></textarea>
                </div>
              </>
            )}

            {activeTab === 'testimonialsPane' && (<div className="col-md-12"><label className="form-label">Курс / Продукт</label><input type="text" name="course" className="form-control" required defaultValue={editingItem?.course || ''} /></div>)}{activeTab !== 'articlesPane' && (
              <div className="col-md-12">
                <label className="form-label">{activeTab === 'faqsPane' ? 'Ответ' : activeTab === 'testimonialsPane' ? 'Текст отзыва' : 'Описание'}</label>
                <textarea name="description" className="form-control" rows={3} required defaultValue={activeTab === 'faqsPane' ? editingItem?.answer || '' : activeTab === 'testimonialsPane' ? editingItem?.text || '' : editingItem?.description || ''}></textarea>
              </div>
            )}

            {['coursesPane', 'consultationsPane', 'toursPane'].includes(activeTab) && (
              <div className="col-md-6">
                <label className="form-label">Цена ({lang === 'en' ? '$' : '₴'})</label>
                <input type="number" name="price" className="form-control" required defaultValue={editingItem?.price || ''} />
              </div>
            )}

            {['videosPane', 'podcastsPane', 'recipesPane', 'articlesPane'].includes(activeTab) && (
              <div className="col-md-6">
                <label className="form-label">Тег</label>
                <input type="text" name="tag" className="form-control" defaultValue={editingItem?.tag || ''} />
              </div>
            )}

            {activeTab === 'videosPane' && (
              <div className="col-md-6">
                <label className="form-label">URL видео</label>
                <input type="text" name="videoUrl" className="form-control" required defaultValue={editingItem?.videoUrl || ''} />
              </div>
            )}

            {activeTab === 'podcastsPane' && (
              <>
                <div className="col-md-6">
                  <label className="form-label">URL аудио</label>
                  <input type="text" name="audioUrl" className="form-control" required defaultValue={editingItem?.audioUrl || ''} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Длительность</label>
                  <input type="text" name="duration" className="form-control" required defaultValue={editingItem?.duration || ''} />
                </div>
              </>
            )}

            {['recipesPane', 'coursesPane', 'consultationsPane', 'toursPane'].includes(activeTab) && (
              <div className="col-md-12">
                <label className="form-label">{activeTab === 'recipesPane' ? 'Полное описание (рецепт)' : 'Подробное инфо для страницы'}</label>
                <textarea name="fullDescription" className="form-control" rows={5} defaultValue={editingItem?.fullDescription || ''}></textarea>
              </div>
            )}
            
            {['coursesPane', 'consultationsPane', 'toursPane'].includes(activeTab) && (
              <div className="col-md-12">
                <label className="form-label">Что ждет на курсе (каждый пункт с новой строки)</label>
                <textarea name="features" className="form-control" rows={4} defaultValue={editingItem?.features || ''} placeholder="Детальные видеоуроки&#10;Доступ навсегда&#10;Поддержка кураторов"></textarea>
              </div>
            )}

            {activeTab === 'recipesPane' && (
              <div className="col-md-6">
                <label className="form-label">Время приготовления</label>
                <input type="text" name="time" className="form-control" required defaultValue={editingItem?.time || ''} />
              </div>
            )}

            {activeTab !== 'podcastsPane' && (
              <div className="col-md-6">
                <label className="form-label">URL изображения <span className="text-danger">*</span></label>
                <div className="d-flex gap-2">
                  <input type="text" id="mainImageUrlInput" name="imageUrl" className="form-control" required defaultValue={editingItem?.imageUrl || editingItem?.thumbnailUrl || ''} />
                  <label className="btn btn-outline-secondary text-nowrap d-flex align-items-center" style={{ cursor: 'pointer' }}>
                    <i className="bi bi-upload me-2"></i>С ПК
                    <input type="file" accept="image/*" className="d-none" onChange={handleMainImageUpload} />
                  </label>
                </div>
              </div>
            )}

            {!editingItem && activeTab === 'coursesPane' && (
              <div className="col-md-6">
                <label className="form-label">Категория</label>
                <select name="category" className="form-select">
                  <option value="beginners">Для начинающих</option>
                  <option value="back">Здоровая спина</option>
                  <option value="meditation">Медитация</option>
                  <option value="women">Женское здоровье</option>
                </select>
              </div>
            )}

            {!editingItem && activeTab === 'consultationsPane' && (
              <div className="col-md-6">
                <label className="form-label">Категория</label>
                <select name="category" className="form-select">
                  <option value="private">Индивидуальные</option>
                  <option value="nutrition">Нутрициология</option>
                  <option value="mentorship">Менторство</option>
                </select>
              </div>
            )}

            {activeTab === 'toursPane' && (
              <>
                <div className="col-md-6">
                  <label className="form-label">Даты</label>
                  <input type="text" name="date" className="form-control" required defaultValue={editingItem?.date || ''} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Локация</label>
                  <input type="text" name="location" className="form-control" required defaultValue={editingItem?.location || ''} />
                </div>
              </>
            )}

            <div className="col-12 mt-4">
              <button type="submit" className="btn btn-dark px-4" disabled={isSubmitting}>
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button type="button" className="btn btn-outline-secondary ms-2 px-4" onClick={closeForm}>
                Отмена
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
        <h3 className="h5 fw-bold mb-0">Управление</h3>
        <button className="btn btn-dark btn-sm px-3 rounded-pill" onClick={openAddForm}>
          <i className="bi bi-plus-lg"></i> Добавить
        </button>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              {columns.map((col, i) => <th key={i}>{col}</th>)}
              <th className="text-end">Действия</th>
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
                <td colSpan={columns.length + 1} className="text-center text-muted py-4">Нет данных</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  return (
    <main style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', paddingTop: '96px' }}>
      <div className="container pb-5">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
              <div>
                  <h1 className="mb-1 font-playfair fw-bold" style={{ color: 'var(--color-text)' }}>{t.admin.titleAdmin}</h1>
                  <p className="mb-0" style={{ color: 'var(--color-text-muted)' }}>Управление курсами, консультациями, блогом и турами.</p>
              </div>
              <div className="badge fs-6" style={{ 
                backgroundColor: isProfileSaved ? '#198754' : (isProfileEdited ? '#ffc107' : 'var(--color-primary)'),
                color: isProfileEdited && !isProfileSaved ? '#000' : '#fff',
                transition: 'all 0.3s ease'
              }}>
                {isProfileSaved ? <><i className="bi bi-check2-circle me-1"></i> Сохранено</> : 'Admin'}
              </div>
          </div>

          {/* Dashboard Stats */}
          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="card border-0 p-4 h-100" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)', background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' }}>
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                    <i className="bi bi-currency-dollar text-success fs-4"></i>
                  </div>
                  <h5 className="mb-0 fw-bold text-muted">Заработано всего</h5>
                </div>
                <h2 className="mb-0 fw-bold">{formatPrice(stats.earnedTotal, lang)}</h2>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 p-4 h-100" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)', background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' }}>
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                    <i className="bi bi-bell text-primary fs-4"></i>
                  </div>
                  <h5 className="mb-0 fw-bold text-muted">Новых заявок</h5>
                </div>
                <h2 className="mb-0 fw-bold">{stats.newRequests}</h2>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 p-4 h-100" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)', background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' }}>
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                    <i className="bi bi-star text-warning fs-4"></i>
                  </div>
                  <h5 className="mb-0 fw-bold text-muted">{t.admin.statPopService}</h5>
                </div>
                <h4 className="mb-0 fw-bold text-truncate" title={stats.popularService}>{stats.popularService}</h4>
              </div>
            </div>
          </div>

          <section className="card border-0 p-4 mb-4" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
              <div className="d-flex flex-wrap gap-2">
                  <button className={`btn rounded-pill px-4 ${activeTab === 'coursesPane' ? 'btn-dark active' : 'btn-outline-dark'}`} onClick={() => {setActiveTab('coursesPane'); closeForm();}}>Курсы</button>
                  <button className={`btn rounded-pill px-4 ${activeTab === 'consultationsPane' ? 'btn-dark active' : 'btn-outline-dark'}`} onClick={() => {setActiveTab('consultationsPane'); closeForm();}}>Консультации</button>
                  <button className={`btn rounded-pill px-4 ${activeTab === 'articlesPane' ? 'btn-dark active' : 'btn-outline-dark'}`} onClick={() => {setActiveTab('articlesPane'); closeForm();}}>Блог</button>
                  <button className={`btn rounded-pill px-4 ${activeTab === 'videosPane' ? 'btn-dark active' : 'btn-outline-dark'}`} onClick={() => {setActiveTab('videosPane'); closeForm();}}>Видео</button>
                  <button className={`btn rounded-pill px-4 ${activeTab === 'podcastsPane' ? 'btn-dark active' : 'btn-outline-dark'}`} onClick={() => {setActiveTab('podcastsPane'); closeForm();}}>Подкасты</button>
                  <button className={`btn rounded-pill px-4 ${activeTab === 'recipesPane' ? 'btn-dark active' : 'btn-outline-dark'}`} onClick={() => {setActiveTab('recipesPane'); closeForm();}}>Рецепты</button>
                  <button className={`btn rounded-pill px-4 ${activeTab === 'toursPane' ? 'btn-dark active' : 'btn-outline-dark'}`} onClick={() => {setActiveTab('toursPane'); closeForm();}}>Туры/Ретриты</button>
                  <button className={`btn rounded-pill px-4 ${activeTab === 'ordersPane' ? 'btn-dark active' : 'btn-outline-dark'}`} onClick={() => {setActiveTab('ordersPane'); closeForm();}}>Заявки</button>
                  <button className={`btn rounded-pill px-4 ${activeTab === 'supportPane' ? 'btn-dark active' : 'btn-outline-dark'}`} onClick={() => {setActiveTab('supportPane'); closeForm();}}>Поддержка</button>
                  <button className={`btn rounded-pill px-4 ${activeTab === 'faqsPane' ? 'btn-dark active' : 'btn-outline-dark'}`} onClick={() => {setActiveTab('faqsPane'); closeForm();}}>FAQ</button><button className={`btn rounded-pill px-4 ${activeTab === 'testimonialsPane' ? 'btn-dark active' : 'btn-outline-dark'}`} onClick={() => {setActiveTab('testimonialsPane'); closeForm();}}>Отзывы</button>
                  <button className={`btn rounded-pill px-4 ${activeTab === 'profilePane' ? 'btn-dark active' : 'btn-outline-dark'}`} onClick={() => {setActiveTab('profilePane'); closeForm();}}>Профиль</button>
              </div>
          </section>

          {renderForm()}

          {activeTab === 'coursesPane' && !isFormOpen && renderTable(
            courses, 'course', ['ID', 'Название', 'Цена'],
            (item) => (<><td>{item.id}</td><td>{item.title}</td><td>{formatPrice(item.price, lang)}</td></>)
          )}

          {activeTab === 'consultationsPane' && !isFormOpen && renderTable(
            consultations, 'consultation', ['ID', 'Название', 'Цена'],
            (item) => (<><td>{item.id}</td><td>{item.title}</td><td>{formatPrice(item.price, lang)}</td></>)
          )}

          {activeTab === 'articlesPane' && !isFormOpen && renderTable(
            articles, 'article', ['ID', 'Заголовок', 'Тег', 'Дата'],
            (item) => (<><td>{item.id}</td><td>{item.title}</td><td>{item.tag || '-'}</td><td>{new Date(item.createdAt).toLocaleDateString()}</td></>)
          )}

          {activeTab === 'videosPane' && !isFormOpen && renderTable(
            videos, 'video', ['ID', 'Название', 'Тег'],
            (item) => (<><td>{item.id}</td><td>{item.title}</td><td>{item.tag || '-'}</td></>)
          )}

          {activeTab === 'podcastsPane' && !isFormOpen && renderTable(
            podcasts, 'podcast', ['ID', 'Название', 'Тег', 'Длительность'],
            (item) => (<><td>{item.id}</td><td>{item.title}</td><td>{item.tag || '-'}</td><td>{item.duration}</td></>)
          )}

          {activeTab === 'recipesPane' && !isFormOpen && renderTable(
            recipes, 'recipe', ['ID', 'Название', 'Тег', 'Время'],
            (item) => (<><td>{item.id}</td><td>{item.title}</td><td>{item.tag || '-'}</td><td>{item.time}</td></>)
          )}

          {activeTab === 'toursPane' && !isFormOpen && renderTable(
            tours, 'tour', ['ID', 'Название', 'Даты', 'Локация', 'Цена'],
            (item) => (<><td>{item.id}</td><td>{item.title}</td><td>{item.date}</td><td>{item.location}</td><td>{formatPrice(item.price, lang)}</td></>)
          )}

          {activeTab === 'faqsPane' && !isFormOpen && renderTable(
            faqs, 'faq', ['ID', 'Вопрос', 'Ответ'],
            (item) => (<><td>{item.id}</td><td>{item.question}</td><td className="text-truncate" style={{maxWidth: '200px'}}>{item.answer}</td></>)
          )}
          {activeTab === 'testimonialsPane' && !isFormOpen && renderTable(
            testimonials, 'testimonial', ['ID', 'Имя', 'Курс', 'Отзыв'],
            (item) => (<><td>{item.id}</td><td>{item.name}</td><td>{item.course}</td><td className="text-truncate" style={{maxWidth: '200px'}}>{item.text}</td></>)
          )}


          {activeTab === 'ordersPane' && !isFormOpen && (
            <section className="card border-0 p-4" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
                <h3 className="h5 fw-bold mb-4">{t.admin.inRequests}</h3>
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Дата</th>
                                <th>Клиент</th>
                                <th>Продукт</th>
                                <th>Сумма</th>
                                <th>Статус</th>
                                <th className="text-end">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td>{order.id}</td>
                                    <td>{order.date}</td>
                                    <td>
                                      {order.customerName || 'Неизвестно'}
                                      {order.userId && <span className="badge bg-light text-dark ms-2 border">Зарегистрирован</span>}
                                      {!order.userId && <span className="badge bg-light text-muted ms-2 border">Гость</span>}
                                    </td>
                                    <td>{order.productName}</td>
                                    <td>{formatPrice(order.price, lang)}</td>
                                    <td>
                                        <span className={`badge ${
                                          order.status === 'Принята' ? 'bg-success' : 
                                          order.status === 'Отклонена' ? 'bg-danger' : 
                                          'bg-warning text-dark'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="text-end">
                                        <select 
                                            className="form-select form-select-sm d-inline-block w-auto me-2"
                                            value={order.status}
                                            onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                                        >
                                            <option value="В обработке">В обработке</option>
                                            <option value="Принята">Принять</option>
                                            <option value="Отклонена">Отклонить</option>
                                        </select>
                                        {(order.status === 'Принята' || order.status === 'Отклонена') && (
                                            <button 
                                                className="btn btn-sm btn-outline-danger border-0" 
                                                onClick={() => handleDeleteOrder(order.id)}
                                                title="Удалить заявку"
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
                                <tr><td colSpan={6} className="text-center text-muted py-4">Нет заявок</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
          )}

          {activeTab === 'supportPane' && !isFormOpen && (
            <section className="card border-0 p-4" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
                <h3 className="h5 fw-bold mb-4">{t.admin.supportMessages}</h3>
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Дата</th>
                                <th>Пользователь</th>
                                <th>Вопрос</th>
                                <th>Статус</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {supportMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(msg => (
                                <tr key={msg.id}>
                                    <td>{new Date(msg.createdAt).toLocaleString()}</td>
                                    <td>
                                      <div><strong>{msg.userName}</strong></div>
                                      <div className="text-muted small">{msg.userEmail}</div>
                                    </td>
                                    <td style={{ maxWidth: '300px' }}>
                                      <div className="fw-bold small text-primary mb-1">{msg.questionType}</div>
                                      <div className="text-truncate" title={msg.message}>{msg.message}</div>
                                      {msg.reply && (
                                        <div className="mt-2 p-2 bg-light rounded small">
                                          <strong>Ответ:</strong> {msg.reply}
                                        </div>
                                      )}
                                    </td>
                                    <td>
                                        <span className={`badge ${msg.status === 'new' ? 'bg-danger' : msg.status === 'replied' ? 'bg-success' : 'bg-secondary'}`}>
                                            {msg.status === 'new' ? 'Новое' : msg.status === 'replied' ? 'Отвечено' : 'Бот'}
                                        </span>
                                    </td>
                                    <td>
                                        {msg.status === 'new' && (
                                          <div className="d-flex flex-column gap-2">
                                            <textarea 
                                              className="form-control form-control-sm" 
                                              rows={2} 
                                              placeholder="Ваш ответ..."
                                              value={replyText[msg.id] || ''}
                                              onChange={(e) => setReplyText({...replyText, [msg.id]: e.target.value})}
                                            />
                                            <button 
                                              className="btn btn-sm btn-dark"
                                              onClick={async () => {
                                                if (!replyText[msg.id]) return;
                                                await replyToMessage(msg.id, replyText[msg.id] ?? '');
                                                getMessages().then(setSupportMessages);
                                                setReplyText({...replyText, [msg.id]: ''});
                                              }}
                                            >
                                              Отправить
                                            </button>
                                          </div>
                                        )}
                                        {msg.status !== 'new' && (
                                          <button 
                                            className="btn btn-sm btn-outline-danger mt-2 w-100"
                                            onClick={async () => {
                                              const confirmed = await modalService.confirm(
                                                "Удалить сообщение?",
                                                "Вы действительно хотите удалить это сообщение?",
                                                "Удалить",
                                                "Отмена"
                                              );
                                              if (confirmed) {
                                                await deleteMessage(msg.id);
                                                getMessages().then(setSupportMessages);
                                              }
                                            }}
                                          >
                                            Удалить
                                          </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {supportMessages.length === 0 && (
                                <tr><td colSpan={5} className="text-center text-muted py-4">Нет сообщений</td></tr>
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
                <h3 className="h5 fw-bold mb-0">{t.admin.profileManage}</h3>
              </div>
              <div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Имя (Отображается в статьях) <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" value={adminProfile.name} onChange={(e) => { setAdminProfile({...adminProfile, name: e.target.value}); setIsProfileEdited(true); }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Email</label>
                    <input type="email" className="form-control" value={adminProfile.email} onChange={(e) => { setAdminProfile({...adminProfile, email: e.target.value}); setIsProfileEdited(true); }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Телефон</label>
                    <input type="tel" className="form-control" value={adminProfile.phone} onChange={(e) => { setAdminProfile({...adminProfile, phone: e.target.value}); setIsProfileEdited(true); }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Фотография <span className="text-danger">*</span></label>
                    <div className="d-flex gap-2">
                      <input type="text" className="form-control" placeholder="URL картинки" value={adminProfile.photoUrl} onChange={(e) => { setAdminProfile({...adminProfile, photoUrl: e.target.value}); setIsProfileEdited(true); }} />
                      <label className="btn btn-outline-secondary text-nowrap d-flex align-items-center" style={{ cursor: 'pointer' }}>
                        <i className="bi bi-upload me-2"></i>С ПК
                        <input type="file" accept="image/*" className="d-none" onChange={handleImageUpload} />
                      </label>
                    </div>
                  </div>
                  <div className="col-12 mt-4 d-flex align-items-center gap-3">
                    <button type="button" onClick={handleProfileSave} className="btn btn-dark px-4 rounded-pill">{t.admin.btnSaveProfile}</button>
                    {isProfileSaved && (
                      <div className="d-flex align-items-center text-success fw-medium" style={{ animation: 'fadeIn 0.3s ease' }}>
                        <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                        Изменения вступили в силу
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="position-fixed bottom-0 end-0 p-4" style={{ zIndex: 1050 }}>
          <div className="toast show align-items-center text-white bg-success border-0 shadow-lg rounded-4" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center fs-6">
                <i className="bi bi-check-circle-fill me-3 fs-4"></i>
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
