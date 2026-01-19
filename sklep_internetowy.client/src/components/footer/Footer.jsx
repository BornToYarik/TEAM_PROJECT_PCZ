import { useState } from "react";
import { useTranslation } from 'react-i18next';

function Footer() {
    const { t } = useTranslation();

    const [form, setForm] = useState({
        email: "",
        name: "",
        phone: "",
        message: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("/api/panel/Message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    name: form.name,
                    phone: form.phone,
                    content: form.message,
                }),
            });

            if (res.ok) {
                alert(t('footer.alerts.success'));
                setForm({ email: "", name: "", phone: "", message: "" });
            } else {
                alert(t('footer.alerts.error'));
            }
        } catch (err) {
            console.error("Error:", err);
        }
    };

    return (
        <footer className="bg-dark text-white">
            <div className="container p-1">
                <div className="row">
                    <div className="m-2 col p-3">
                        <h3 className="text-center">{t('footer.contactHeader')}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">{t('footer.email')}</label>
                                <input type="email" className="form-control" id="email"
                                    value={form.email} onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label">{t('footer.name')}</label>
                                <input type="text" className="form-control" id="name"
                                    value={form.name} onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="phone" className="form-label">{t('footer.phone')}</label>
                                <input type="tel" className="form-control" id="phone"
                                    value={form.phone} onChange={handleChange} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="message" className="form-label">{t('footer.message')}</label>
                                <textarea className="form-control" id="message" rows="4"
                                    value={form.message} onChange={handleChange} required />
                            </div>
                            <button type="submit" className="btn btn-primary w-100">{t('footer.send')}</button>
                        </form>
                    </div>

                    <div className="text-center m-2 col p-3 d-flex flex-column">
                        <h2>{t('footer.findUsHeader')}</h2>
                        <p>{t('footer.weAreHere')}</p>
                        <div className="flex-grow-1">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3122.4661122418543!2d19.11033438502615!3d50.821959720042706!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4710b67ff80b3837%3A0x61ec2121cf6c7a95!2sGenera%C5%82a%20Jana%20Henryka%20D%C4%85browskiego%2073%2C%2042-202%20Cz%C4%99stochowa!5e1!3m2!1spl!2spl!4v1760549645792!5m2!1spl!2spl"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Google Maps"
                            ></iframe>
                        </div>
                    </div>
                </div>
                <hr></hr>
                <div className="text-center mt-4 mb-4">
                    <p>{t('footer.copyright')}</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer;