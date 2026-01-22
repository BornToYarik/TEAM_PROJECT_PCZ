import React, { useState, useEffect } from 'react';

/**
 * @file ProductForm.jsx
 * @brief Komponent formularza przeznaczony do tworzenia i edycji produktow w panelu administracyjnym.
 * @details Obsluguje wprowadzanie danych tekstowych, numerycznych, wybor kategorii z API oraz przesylanie plikow graficznych.
 */

/**
 * @component ProductForm
 * @description Zarzadza stanem formularza produktu, walidacja pol oraz przygotowaniem danych do wysylki (w tym plikow).
 * @param {Object} props - Wlasciwosci komponentu.
 * @param {Function} props.onSubmit - Funkcja wywolywana przy zapisie, przyjmuje (data, files).
 * @param {Function} props.onCancel - Funkcja anulujaca edycje/tworzenie.
 * @param {Object} props.initialData - Dane istniejacego produktu uzywane do wypelnienia pol w trybie edycji.
 * @param {Boolean} props.isEditing - Flaga przelaczajaca naglowki i etykiety przyciskow miedzy trybem tworzenia a edycji.
 */
const ProductForm = ({ onSubmit, onCancel, initialData, isEditing }) => {
    /** @brief Stan przechowuj?cy dane tekstowe i numeryczne formularza. */
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        price: '',
        quantity: '',
        description: '',
        categoryId: '',
        discountPercentage: '',
        discountStartDate: '',
        discountEndDate: ''
    });
    /** @brief Lista kategorii pobrana z serwera dla menu rozwijanego. */
    const [categories, setCategories] = useState([]);
    /** @brief Obiekt przechowujacy komunikaty bledow walidacji dla poszczegolnych pol. */
    const [errors, setErrors] = useState({});
    /** @brief Tablica wybranych przez uzytkownika plikow graficznych. */
    const [selectedFiles, setSelectedFiles] = useState([]);
    /** @brief Podstawowy adres URL do punktu koncowego produktow. */
    const API_URL = '/api/panel/Product';
    /** * @effect Pobiera liste kategorii przy montowaniu komponentu.
     */
    useEffect(() => {
        fetchCategories();
    }, []);
    /**
     * @effect Inicjalizuje formularz danymi z initialData, jesli zostaly przekazane (tryb edycji).
     */
    useEffect(() => {
        if (initialData) {
            /** * @function formatDate
             * @description Konwertuje date ISO na format akceptowany przez input type="date" (YYYY-MM-DD).
             */
            const formatDate = (dateString) => {
                if (!dateString) return '';
                return new Date(dateString).toISOString().substring(0, 10);
            };

            setFormData({
                name: initialData.name || '',
                brand: initialData.brand || '',
                price: initialData.price?.toString() || '',
                quantity: initialData.quantity?.toString() || '',
                description: initialData.description || '',
                categoryId: initialData.productCategoryId?.toString() || '',
                discountPercentage: initialData.discountPercentage?.toString() || '',
                discountStartDate: formatDate(initialData.discountStartDate),
                discountEndDate: formatDate(initialData.discountEndDate)
            });
        }
    }, [initialData]);
    /**
    * @function fetchCategories
    * @async
    * @description Pobiera dostepne kategorie produktow z serwera.
    */
    const fetchCategories = async () => {
        try {
            const response = await fetch(`/api/ProductCategory`);
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };
    /**
    * @function handleFileChange
    * @description Obsluguje wybor plikow graficznych i aktualizuje stan selectedFiles.
    * @param {Event} e - Zdarzenie zmiany inputa typu file.
    */
    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files));
    };
    /**
     * @function handleInputChange
     * @description Uniwersalny handler dla pol tekstowych i numerycznych. Usuwa blad pola przy zmianie.
     * @param {Event} e - Zdarzenie zmiany pola input.
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };
    /**
     * @function validateForm
     * @description Sprawdza poprawnosc wypelnienia wymaganych pol formularza.
     * @returns {Boolean} True, jesli formularz jest poprawny, w przeciwnym razie False.
     */
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Product name is required';
        }

        if (!formData.brand.trim()) {
            newErrors.brand = 'Brand is required';
        }

        if (!formData.price) {
            newErrors.price = 'Price is required';
        } else if (parseFloat(formData.price) <= 0) {
            newErrors.price = 'Price must be greater than 0';
        }

        if (formData.quantity === '') {
            newErrors.quantity = 'Quantity is required';
        } else if (parseInt(formData.quantity) < 0) {
            newErrors.quantity = 'Quantity cannot be negative';
        }

        if (!formData.categoryId) {
            newErrors.categoryId = 'Category is required';
        }

        const discPercent = parseFloat(formData.discountPercentage);
        if (formData.discountPercentage && (isNaN(discPercent) || discPercent < 0 || discPercent > 100)) {
            newErrors.discountPercentage = 'Discount must be between 0 and 100';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    /**
     * @function handleSubmit
     * @description Obsluguje zdarzenie wyslania formularza. Po walidacji wywoluje props.onSubmit z przygotowanym obiektem.
     * @param {Event} e - Zdarzenie submit formularza.
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            const dataToSend = {
                name: formData.name,
                brand: formData.brand,
                price: parseFloat(formData.price),
                quantity: parseInt(formData.quantity),
                description: formData.description || null,
                ProductCategoryId: parseInt(formData.categoryId),
                DiscountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : null,
                DiscountStartDate: formData.discountStartDate || null,
                DiscountEndDate: formData.discountEndDate || null,
            };

            onSubmit(dataToSend, selectedFiles);
        }
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <h5 className="card-title">
                    {isEditing ? 'Edit Product' : 'New Product'}
                </h5>
                <div>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Product Name *</label>
                            <input
                                type="text"
                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                            {errors.name && (
                                <div className="invalid-feedback d-block">{errors.name}</div>
                            )}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Brand *</label>
                            <input
                                type="text"
                                className={`form-control ${errors.brand ? 'is-invalid' : ''}`}
                                name="brand"
                                value={formData.brand}
                                onChange={handleInputChange}
                                placeholder="e.g. Apple, Samsung"
                            />
                            {errors.brand && (
                                <div className="invalid-feedback d-block">{errors.brand}</div>
                            )}
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Category *</label>
                        <select
                            className={`form-select ${errors.categoryId ? 'is-invalid' : ''}`}
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleInputChange}
                        >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {errors.categoryId && (
                            <div className="invalid-feedback d-block">{errors.categoryId}</div>
                        )}
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Price *</label>
                            <input
                                type="number"
                                className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                step="0.01"
                                min="0"
                            />
                            {errors.price && (
                                <div className="invalid-feedback d-block">{errors.price}</div>
                            )}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Quantity *</label>
                            <input
                                type="number"
                                className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleInputChange}
                                min="0"
                            />
                            {errors.quantity && (
                                <div className="invalid-feedback d-block">{errors.quantity}</div>
                            )}
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Discount Percentage (%)</label>
                        <input
                            type="number"
                            className={`form-control ${errors.discountPercentage ? 'is-invalid' : ''}`}
                            name="discountPercentage"
                            value={formData.discountPercentage}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                            max="100"
                        />
                        {errors.discountPercentage && (
                            <div className="invalid-feedback d-block">{errors.discountPercentage}</div>
                        )}
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Discount Start Date</label>
                            <input
                                type="date"
                                className="form-control"
                                name="discountStartDate"
                                value={formData.discountStartDate}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Discount End Date</label>
                            <input
                                type="date"
                                className="form-control"
                                name="discountEndDate"
                                value={formData.discountEndDate}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-control"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="3"
                        ></textarea>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Product Images</label>
                        <input
                            type="file"
                            className="form-control"
                            multiple
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                    </div>

                    <div className="d-flex gap-2">
                        <button onClick={handleSubmit} className="btn btn-success">
                            {isEditing ? 'Update' : 'Create'}
                        </button>
                        <button onClick={onCancel} className="btn btn-secondary">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductForm;