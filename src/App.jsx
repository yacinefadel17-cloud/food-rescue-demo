import React, { useEffect, useMemo, useState } from "react";
import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import "./App.css";

const features = [
  {
    icon: "♻️",
    title: "نقلل التبذير",
    text: "نحوّل فائض الطعام إلى فرصة حقيقية للاستفادة بدل أن ينتهي به المطاف في النفايات.",
  },
  {
    icon: "🤝",
    title: "نربط الناس",
    text: "نجمع المتبرعين والمستفيدين والجمعيات في منصة واحدة بسيطة وسريعة.",
  },
  {
    icon: "🍲",
    title: "الخير يوصل لمن يحتاجه",
    text: "اكتشف التبرعات المتاحة حسب منطقتك وتواصل مع المتبرع مباشرة.",
  },
];

/* ==========================================
   1. NAVBAR COMPONENT
========================================== */
function Navbar({ page, goTo, scrollToSection, user, handleLogout }) {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <button className="brand" onClick={() => goTo("home")}>
          <span className="brand-logo">🌱</span>
          <span>
            <strong>إطعام</strong>
            <small>خيرك يوصل لغيرك</small>
          </span>
        </button>

        <nav>
          <button
            className={page === "home" ? "active" : ""}
            onClick={() => goTo("home")}
          >
            الرئيسية
          </button>
          <button
            className={page === "donations" ? "active" : ""}
            onClick={() => goTo("donations")}
          >
            التبرعات
          </button>
          <button onClick={() => scrollToSection("how-it-works")}>
            كيف تعمل؟
          </button>
          <button onClick={() => scrollToSection("about-us")}>
            عن المنصة
          </button>
        </nav>

        <div className="navbar-actions">
          {user ? (
            <>
              <button className="user-btn" onClick={() => goTo("dashboard")}>
                👤 حسابي
              </button>
              <button className="btn btn-outline" onClick={handleLogout}>
                خروج
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => goTo("auth")}>
              تسجيل الدخول
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

/* ==========================================
   2. FOOTER COMPONENT
========================================== */
function Footer({ goTo }) {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            🌱 <strong>إطعام</strong>
          </div>
          <p>منصة رقمية لمحاربة هدر الطعام ونشر ثقافة المشاركة.</p>
        </div>
        <div>
          <h4>المنصة</h4>
          <button onClick={() => goTo("home")}>الرئيسية</button>
          <button onClick={() => goTo("donations")}>التبرعات</button>
        </div>
        <div>
          <h4>شارك الخير</h4>
          <button onClick={() => goTo("auth")}>تبرع أو استفد الآن</button>
          <button onClick={() => goTo("donations")}>اكتشف التبرعات</button>
        </div>
      </div>
      <div className="copyright">
        © {new Date().getFullYear()} إطعام — جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}

/* ==========================================
   3. HOME PAGE
========================================== */
function HomePage({ donations, goTo }) {
  return (
    <>
      <section className="hero">
        <div className="hero-background-circle circle-1"></div>
        <div className="hero-background-circle circle-2"></div>

        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">🌍 معًا ضد هدر الطعام</div>
            <h1>
              وجبة فائضة عندك، <span> خير كبير </span> عند غيرك.
            </h1>
            <p>
              منصة إطعام تربط المطاعم والفنادق والأفراد بالجمعيات والمستفيدين، حتى يتحول فائض الطعام إلى أثر إنساني حقيقي.
            </p>
            <div className="hero-buttons">
              <button
                className="btn btn-primary btn-large"
                onClick={() => goTo("auth")}
              >
                انضم كمتبرع أو مستفيد <span>←</span>
              </button>
              <button
                className="btn btn-light btn-large"
                onClick={() => goTo("donations")}
              >
                أبحث عن تبرعات <span>←</span>
              </button>
            </div>
            <div className="hero-trust">
              <span>✓ مجاني</span>
              <span>✓ سهل الاستخدام</span>
              <span>✓ متاح للجميع</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="food-circle">🍲</div>
            <div className="food-card">
              <div className="food-card-image">🍱</div>
              <div className="food-card-content">
                <span className="available">● متوفر الآن</span>
                <h3>وجبات ساخنة</h3>
                <p>15 وجبة • المسيلة</p>
              </div>
              <div className="heart">♡</div>
            </div>
            <div className="floating-card floating-top">
              <div className="floating-icon">🤝</div>
              <div>
                <strong>خير يصل بسرعة</strong>
                <small>تبرعات محلية</small>
              </div>
            </div>
            <div className="floating-card floating-bottom">
              <div className="floating-icon">♻️</div>
              <div>
                <strong>أقل هدرًا</strong>
                <small>أكثر أثرًا</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="container stats-grid">
          <div className="stat">
            <strong>{donations.length}</strong>
            <span>تبرعات منشورة</span>
          </div>
          <div className="stat">
            <strong>
              {donations.reduce(
                (sum, item) => sum + (Number(item.quantity) || 0),
                0
              ) || "—"}
            </strong>
            <span>وجبة / كمية مسجلة</span>
          </div>
          <div className="stat">
            <strong>24/7</strong>
            <span>المنصة متاحة</span>
          </div>
        </div>
      </section>

      <section className="section" id="about-us">
        <div className="container">
          <div className="section-title">
            <span>لماذا إطعام؟</span>
            <h2>من فائض الطعام إلى أثر جميل</h2>
            <p>حل بسيط لمشكلة كبيرة: نساعد الطعام الجيد على الوصول إلى من يحتاجه.</p>
          </div>
          <div className="features-grid">
            {features.map((feature) => (
              <div className="feature-card" key={feature.title}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="container">
          <div className="section-title">
            <span>كيف تعمل المنصة؟</span>
            <h2>ثلاث خطوات فقط</h2>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-number">01</div>
              <h3>انشر التبرع</h3>
              <p>أدخل نوع الطعام والكمية والموقع.</p>
            </div>
            <div className="step">
              <div className="step-number">02</div>
              <h3>سجل واطلب</h3>
              <p>أنشئ حسابك كجمعية أو مستفيد لحجز الوجبات المناسبة.</p>
            </div>
            <div className="step">
              <div className="step-number">03</div>
              <h3>يصل الخير</h3>
              <p>يتواصل المستفيد مع المتبرع واستلام التبرع مباشرة.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta">
            <div>
              <span>جاهز تبدأ؟</span>
              <h2>لا تخلي فائضك يروح هدر.</h2>
              <p>سجل معنا كمتبرع أو مستفيد وخلي الخير يبدأ من عندك.</p>
            </div>
            <button
              className="btn btn-white btn-large"
              onClick={() => goTo("auth")}
            >
              إنشاء حساب الآن ←
            </button>
          </div>
        </div>
      </section>

      <Footer goTo={goTo} />
    </>
  );
}

/* ==========================================
   4. DONATIONS PAGE
========================================== */
function DonationsPage({
  user,
  goTo,
  search,
  setSearch,
  loading,
  filteredDonations,
  handleToggleClaim,
}) {
  return (
    <main className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <span>الوجبات المتاحة</span>
            <h1>تبرعات قريبة منك</h1>
            <p>اكتشف الطعام المتوفر وتواصل مع المتبرع مباشرة.</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => (user ? goTo("dashboard") : goTo("auth"))}
          >
            + أضف تبرعًا
          </button>
        </div>

        <div className="search">
          <span>🔎</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن وجبة، كمية أو منطقة..."
          />
        </div>

        {loading ? (
          <div className="empty">جاري تحميل التبرعات...</div>
        ) : filteredDonations.length === 0 ? (
          <div className="empty">
            <div>🍽️</div>
            <h3>لا توجد تبرعات حالياً</h3>
            <p>كن أول شخص ينشر تبرعًا على المنصة.</p>
          </div>
        ) : (
          <div className="donations-grid">
            {filteredDonations.map((item) => {
              const isClaimed = item.status === "claimed";
              const isOwner = user && user.email === item.donorEmail;

              return (
                <div
                  className={`donation-card ${isClaimed ? "card-claimed" : ""}`}
                  key={item.id}
                >
                  <div className="donation-card-top">
                    {isClaimed ? (
                      <span className="claimed-badge">✖ محجوز</span>
                    ) : (
                      <span className="available">● متوفر الآن</span>
                    )}
                    <div className="donation-icon">🍱</div>
                  </div>
                  <h3>{item.title}</h3>
                  <div className="details">
                    <p>📦 <strong>الكمية:</strong> {item.quantity}</p>
                    <p>📍 <strong>الموقع:</strong> {item.location}</p>
                    <p>📞 <strong>الهاتف:</strong> {item.phone}</p>
                  </div>

                  {item.coords && item.coords.latitude && (
                    <div style={{ marginTop: "10px" }}>
                      <a
                        href={`https://www.google.com/maps?q=${item.coords.latitude},${item.coords.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="map-link-btn"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          color: "#16a34a",
                          textDecoration: "none",
                          fontSize: "13px",
                          fontWeight: "bold",
                          backgroundColor: "#f0fdf4",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          border: "1px solid #bbf7d0",
                        }}
                      >
                        🗺️ فتح الموقع على الخريطة (GPS)
                      </a>
                    </div>
                  )}

                  <div className="donor">المتبرع: {item.donorEmail || "غير معروف"}</div>

                  <div className="donation-card-actions">
                    {item.phone && item.phone !== "غير متوفر" && !isClaimed && (
                      <a className="contact-btn" href={`tel:${item.phone}`}>
                        تواصل مع المتبرع
                      </a>
                    )}

                    {isOwner ? (
                      <button
                        className={`claim-btn ${isClaimed ? "btn-claim" : "btn-cancel"}`}
                        onClick={() => handleToggleClaim(item)}
                      >
                        {isClaimed ? "إعادة توفير التبرع" : "تغيير الحالة إلى: محجوز"}
                      </button>
                    ) : (
                      <span className="status-label" style={{ fontSize: "12px", color: "#888" }}>
                        {isClaimed ? "تم حجز هذا التبرع" : "تبرع متاح للتواصل"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

/* ==========================================
   5. AUTH PAGE
========================================== */
function AuthPage({
  goTo,
  isRegistering,
  setIsRegistering,
  email,
  setEmail,
  password,
  setPassword,
  authError,
  setAuthError,
  authLoading,
  handleAuth,
}) {
  useEffect(() => {
    setEmail("");
    setPassword("");
    setAuthError("");
  }, [isRegistering, setEmail, setPassword, setAuthError]);

  const handleSubmitOnEnter = (e) => {
    if (e.key === "Enter") {
      handleAuth(e);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-side">
        <div className="auth-illustration">🍲</div>
        <h2>كل تبرع يصنع فرقًا.</h2>
        <p>انضم إلى مجتمع إطعام سواء كنت متبرعًا، جمعية خيرية، أو مستفيدًا.</p>
      </div>

      <div className="auth-content">
        <button className="back" onClick={() => goTo("home")}>
          → الرئيسية
        </button>

        <div className="auth-box">
          <span>حساب المستخدم / الجمعيات</span>
          <h1>{isRegistering ? "إنشاء حساب جديد" : "مرحبًا بعودتك"}</h1>
          <p>
            {isRegistering
              ? "أنشئ حسابك للبدء في التبرع أو أخذ الوجبات المتاحة."
              : "سجل دخولك لإدارة حسابك وتفاعلاتك."}
          </p>

          <div className="custom-auth-wrapper" onKeyDown={handleSubmitOnEnter}>
            <label>
              البريد الإلكتروني
              <input
                type="text"
                name="user_identifier_x9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                autoComplete="off"
              />
            </label>

            <label>
              كلمة المرور
              <input
                type="text"
                name="user_secret_k2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="off"
                style={{ WebkitTextSecurity: "disc" }}
              />
            </label>

            {authError && <div className="error">{authError}</div>}

            <button
              type="button"
              className="btn btn-primary full"
              onClick={handleAuth}
              disabled={authLoading}
            >
              {authLoading
                ? "جاري المعالجة..."
                : isRegistering
                ? "إنشاء الحساب"
                : "تسجيل الدخول"}
            </button>
          </div>

          <button
            className="switch-auth"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setAuthError("");
              setEmail("");
              setPassword("");
            }}
          >
            {isRegistering
              ? "لديك حساب بالفعل؟ سجل الدخول"
              : "ليس لديك حساب؟ أنشئ حسابًا جديدًا"}
          </button>
        </div>
      </div>
    </main>
  );
}

/* ==========================================
   6. DASHBOARD PAGE
========================================== */
function DashboardPage({
  user,
  goTo,
  title,
  setTitle,
  quantity,
  setQuantity,
  location,
  setLocation,
  phone,
  setPhone,
  coords,
  setCoords,
  isGettingLocation,
  handleGetLocation,
  handleSubmitDonation,
  handleDeleteDonation,
  donations,
}) {
  const userDonations = donations.filter((d) => d.donorEmail === user?.email);

  return (
    <main className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <span>لوحة التحكم</span>
            <h1>مرحبًا بك 👋</h1>
            <p>{user?.email}</p>
          </div>
          <button className="btn btn-light" onClick={() => goTo("donations")}>
            مشاهدة التبرعات المتاحة
          </button>
        </div>

        <div className="dashboard-grid">
          <section className="dashboard-card">
            <div className="dashboard-title">
              <div>
                <span>تبرع جديد</span>
                <h2>أضف فائض الطعام</h2>
              </div>
              <div className="dashboard-icon">🍲</div>
            </div>

            <form className="donation-form" onSubmit={handleSubmitDonation}>
              <label>
                نوع الوجبة
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: 15 وجبة كسكسي"
                  required
                />
              </label>

              <label>
                الكمية
                <input
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="مثال: 15 وجبة"
                  required
                />
              </label>

              <label>
                الموقع (اسم الحي / البلدية)
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="الحي أو المنطقة"
                  required
                />
              </label>

              <div style={{ marginBottom: "15px" }}>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: coords ? "#e0f2fe" : "#f3f4f6",
                    color: coords ? "#0369a1" : "#374151",
                    border: "1px dashed " + (coords ? "#0284c7" : "#d1d5db"),
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  {isGettingLocation
                    ? "⏳ جاري تحديد موقعك الجغرافي..."
                    : coords
                    ? "✅ تم تحديد موقع الـ GPS بنجاح!"
                    : "📍 انقر لتحديد موقعك الحالي على الخريطة (اختياري)"}
                </button>
              </div>

              <label>
                رقم الهاتف
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05 XX XX XX XX"
                />
              </label>

              <button className="btn btn-primary full">
                نشر التبرع الآن 🚀
              </button>
            </form>
          </section>

          <aside className="impact-card">
            <span>أثرك حتى الآن</span>
            <strong>{userDonations.length}</strong>
            <h3>تبرعات منشورة</h3>
            <p>
              كل وجبة تنقذها من الهدر يمكن أن تكون سببًا في إسعاد شخص آخر.
            </p>

            {userDonations.length > 0 && (
              <div style={{ marginTop: "20px", textAlign: "right" }}>
                <h4>إدارة تبرعاتك:</h4>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {userDonations.map((d) => (
                    <li
                      key={d.id}
                      style={{
                        marginBottom: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>
                        {d.title} ({d.status === "claimed" ? "محجوز" : "متوفر"})
                      </span>
                      <button
                        onClick={() => handleDeleteDonation(d.id)}
                        style={{
                          color: "red",
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        🗑️ حذف
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

/* ==========================================
   7. MAIN APP COMPONENT
========================================== */
export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");

  const [coords, setCoords] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (page === "dashboard" && !user) {
      setPage("auth");
    }
  }, [page, user]);

  useEffect(() => {
    const q = query(
      collection(db, "donations"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setDonations(items);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredDonations = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return donations;

    return donations.filter((item) =>
      [item.title, item.quantity, item.location, item.phone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }, [donations, search]);

  const goTo = (nextPage) => {
    setPage(nextPage);

    setEmail("");
    setPassword("");
    setAuthError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToSection = (sectionId) => {
    if (page !== "home") {
      setPage("home");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("متصفحك لا يدعم خاصية تحديد الموقع (Geolocation).");
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("خطأ في تحديد الموقع:", error);
        alert("تعذر الوصول إلى موقعك. يرجى السماح للمتصفح بالوصول للـ GPS.");
        setIsGettingLocation(false);
      }
    );
  };

  const handleToggleClaim = async (item) => {
    if (!user) {
      alert("يرجى تسجيل الدخول أولاً.");
      setIsRegistering(true);
      goTo("auth");
      return;
    }

    const isOwner = user.email === item.donorEmail;

    if (!isOwner) {
      alert("عذراً، لا يمكنك تغيير حالة هذا التبرع لأنك لست صاحبه الأصلي.");
      return;
    }

    try {
      const docRef = doc(db, "donations", item.id);
      const newStatus = item.status === "available" ? "claimed" : "available";

      await updateDoc(docRef, {
        status: newStatus,
      });

      alert(newStatus === "claimed" ? "تم تغيير الحالة إلى محجوز" : "تمت إعادة توفير التبرع");
    } catch (error) {
      console.error("خطأ Firebase:", error);
      alert("حدث خطأ، أو أنك لا تملك صلاحية التعديل على هذا التبرع.");
    }
  };

  const handleDeleteDonation = async (id) => {
    if (window.confirm("هل أنت متأكد من رغبتك في حذف هذا التبرع؟")) {
      try {
        await deleteDoc(doc(db, "donations", id));
      } catch (error) {
        console.error("خطأ في حذف التبرع:", error);
        alert("لا يمكنك حذف هذا التبرع لأنك لست صاحبه الأصلي.");
      }
    }
  };

  const handleAuth = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    setAuthError("");
    setAuthLoading(true);

    try {
      await setPersistence(auth, browserLocalPersistence);

      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      setEmail("");
      setPassword("");

      goTo("donations");
    } catch (error) {
      console.error(error);

      setAuthError("تعذر العملية. تأكد من صحة البريد الإلكتروني وكلمة المرور.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    goTo("home");
  };

  const handleSubmitDonation = async (e) => {
    e.preventDefault();

    if (!title || !quantity || !location) {
      return;
    }

    try {
      await addDoc(collection(db, "donations"), {
        title,
        quantity,
        location,
        phone: phone || "غير متوفر",
        coords: coords || null,
        donorEmail: user?.email,
        status: "available",
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setQuantity("");
      setLocation("");
      setPhone("");
      setCoords(null);

      alert("تم نشر التبرع بنجاح 🌱");

      goTo("donations");
    } catch (error) {
      console.error("خطأ في إضافة التبرع:", error);
      alert("حدث خطأ أثناء نشر التبرع.");
    }
  };

  return (
    <div className="app">
      <Navbar
        page={page}
        goTo={goTo}
        scrollToSection={scrollToSection}
        user={user}
        handleLogout={handleLogout}
      />

      {page === "home" && <HomePage donations={donations} goTo={goTo} />}

      {page === "donations" && (
        <DonationsPage
          user={user}
          goTo={goTo}
          search={search}
          setSearch={setSearch}
          loading={loading}
          filteredDonations={filteredDonations}
          handleToggleClaim={handleToggleClaim}
        />
      )}

      {page === "auth" && (
        <AuthPage
          goTo={goTo}
          isRegistering={isRegistering}
          setIsRegistering={setIsRegistering}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          authError={authError}
          setAuthError={setAuthError}
          authLoading={authLoading}
          handleAuth={handleAuth}
        />
      )}

      {page === "dashboard" && (
        <DashboardPage
          user={user}
          goTo={goTo}
          title={title}
          setTitle={setTitle}
          quantity={quantity}
          setQuantity={setQuantity}
          location={location}
          setLocation={setLocation}
          phone={phone}
          setPhone={setPhone}
          coords={coords}
          setCoords={setCoords}
          isGettingLocation={isGettingLocation}
          handleGetLocation={handleGetLocation}
          handleSubmitDonation={handleSubmitDonation}
          handleDeleteDonation={handleDeleteDonation}
          donations={donations}
        />
      )}
    </div>
  );
}
