import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

/**
 * @file InvoiceTemplates.jsx
 * @brief Szablony dokumentów PDF (faktury i paragony) generowane przy użyciu biblioteki @react-pdf/renderer.
 * @details Plik zawiera definicje stylów CSS-in-JS oraz komponenty React odpowiedzialne za renderowanie
 * profesjonalnych dokumentów sprzedaży gotowych do druku lub zapisu.
 */

/**
 * @section Styles
 * @brief Konfiguracja stylów graficznych dla dokumentu faktury.
 */
const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },

    headerContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20 },
    headerTitle: { fontSize: 32, fontWeight: 'light', letterSpacing: 2, textTransform: 'uppercase' },
    divider: { borderBottomWidth: 1, borderBottomColor: '#AAAAAA', marginBottom: 20 },

    infoContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    infoColumnLeft: { flexDirection: 'column', width: '50%' },
    infoColumnRight: { flexDirection: 'column', width: '40%', alignItems: 'flex-end' },

    label: { color: '#666', fontSize: 9, marginBottom: 2, textTransform: 'uppercase', fontWeight: 'bold' },
    text: { fontSize: 10, marginBottom: 4 },
    textBold: { fontSize: 10, fontWeight: 'bold', marginBottom: 4 },

    dateRow: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%', marginBottom: 4 },
    dateLabel: { color: '#666', fontSize: 9, marginRight: 10, textTransform: 'uppercase' },
    dateValue: { fontSize: 10, textAlign: 'right', minWidth: 60 },

    tableContainer: { marginTop: 20, marginBottom: 20 },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingBottom: 5,
        marginBottom: 5
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingVertical: 8
    },

    colDesc: { width: '50%' },
    colPrice: { width: '15%', textAlign: 'right' },
    colQty: { width: '15%', textAlign: 'center' },
    colTotal: { width: '20%', textAlign: 'right' },

    th: { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', color: '#666' },

    totalsContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
    totalsBlock: { width: '40%' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    grandTotal: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: '#333', paddingTop: 5, marginTop: 5 },
    grandTotalText: { fontSize: 12, fontWeight: 'bold' }
});

/**
 * @section SimpleStyles
 * @brief Minimalistyczne style dla uproszczonego paragonu.
 */
const simpleStyles = StyleSheet.create({
    page: { flexDirection: 'column', backgroundColor: '#FFFFFF', padding: 30 },
    section: { margin: 10, padding: 10, flexGrow: 1 },
    header: { fontSize: 24, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
    row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 5, marginBottom: 5 },
    label: { width: '60%', fontSize: 12 },
    value: { width: '40%', fontSize: 12, textAlign: 'right' },
    total: { marginTop: 20, fontSize: 14, textAlign: 'right', fontWeight: 'bold' }
});

/**
 * @component InvoiceDocument
 * @brief Komponent renderujący pełny dokument faktury VAT.
 * @param {Object} props Właściwości komponentu.
 * @param {Object} props.order Obiekt zamówienia zawierający dane klienta, status oraz listę produktów.
 * @returns {JSX.Element} Obiekt dokumentu PDF.
 */
export const InvoiceDocument = ({ order }) => {
    const subtotal = order.products.reduce((sum, p) => sum + (p.price * p.quantityInOrder), 0);
    const taxRate = 0.23; // 23% VAT (stawka domyślna)
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    const today = new Date().toLocaleDateString();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                <View style={styles.divider} />
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>FAKTURA VAT</Text>
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.infoColumnLeft}>
                        <Text style={styles.label}>NABYWCA:</Text>
                        <Text style={styles.textBold}>{order.userEmail}</Text>
                        <Text style={styles.text}>ID Klienta: {order.userId}</Text>
                        <Text style={styles.text}>Ul. Przykładowa 12/3</Text>
                        <Text style={styles.text}>00-001 Warszawa, Polska</Text>

                        <Text style={[styles.label, { marginTop: 15 }]}>SPRZEDAWCA:</Text>
                        <Text style={styles.textBold}>TechShop Sp. z o.o.</Text>
                        <Text style={styles.text}>Bank: mBank Polska</Text>
                        <Text style={styles.text}>Konto: PL 12 3456 7890 0000 0000</Text>
                    </View>

                    <View style={styles.infoColumnRight}>
                        <View style={styles.dateRow}>
                            <Text style={styles.dateLabel}>NR FAKTURY:</Text>
                            <Text style={styles.dateValue}>#{order.id}</Text>
                        </View>
                        <View style={styles.dateRow}>
                            <Text style={styles.dateLabel}>DATA WYSTAWIENIA:</Text>
                            <Text style={styles.dateValue}>{today}</Text>
                        </View>
                        <View style={styles.dateRow}>
                            <Text style={styles.dateLabel}>TERMIN PŁATNOŚCI:</Text>
                            <Text style={styles.dateValue}>{dueDate.toLocaleDateString()}</Text>
                        </View>
                        <View style={styles.dateRow}>
                            <Text style={styles.dateLabel}>STATUS:</Text>
                            <Text style={styles.dateValue}>{order.status}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.th, styles.colDesc]}>NAZWA USŁUGI/TOWARU</Text>
                        <Text style={[styles.th, styles.colPrice]}>CENA JEDN.</Text>
                        <Text style={[styles.th, styles.colQty]}>ILOŚĆ</Text>
                        <Text style={[styles.th, styles.colTotal]}>WARTOŚĆ</Text>
                    </View>

                    {order.products.map((product, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={[styles.text, styles.colDesc]}>{product.name}</Text>
                            <Text style={[styles.text, styles.colPrice]}>{product.price.toFixed(2)} zl</Text>
                            <Text style={[styles.text, styles.colQty]}>{product.quantityInOrder}</Text>
                            <Text style={[styles.text, styles.colTotal]}>{(product.price * product.quantityInOrder).toFixed(2)} zl</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.totalsContainer}>
                    <View style={styles.totalsBlock}>
                        <View style={styles.totalRow}>
                            <Text style={styles.text}>NETTO</Text>
                            <Text style={styles.text}>{subtotal.toFixed(2)} zl</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.text}>VAT (23%)</Text>
                            <Text style={styles.text}>{taxAmount.toFixed(2)} zl</Text>
                        </View>
                        <View style={styles.grandTotal}>
                            <Text style={styles.grandTotalText}>SUMA BRUTTO</Text>
                            <Text style={styles.grandTotalText}>{total.toFixed(2)} zl</Text>
                        </View>
                    </View>
                </View>

            </Page>
        </Document>
    );
};

/**
 * @component SimpleReceipt
 * @brief Komponent renderujący uproszczony paragon fiskalny.
 * @param {Object} props Właściwości komponentu.
 * @param {Object} props.order Obiekt zamówienia zawierający listę produktów.
 * @returns {JSX.Element} Obiekt dokumentu PDF.
 */
export const SimpleReceipt = ({ order }) => {
    const total = order.products.reduce((sum, p) => sum + (p.price * p.quantityInOrder), 0);

    return (
        <Document>
            <Page size="A4" style={simpleStyles.page}>
                <View style={simpleStyles.section}>
                    <Text style={simpleStyles.header}>Paragon #{order.id}</Text>
                    <Text style={{ fontSize: 12, marginBottom: 10 }}>Klient: {order.userEmail}</Text>
                </View>
                <View style={simpleStyles.section}>
                    <Text style={{ fontSize: 14, marginBottom: 10, borderBottomWidth: 2 }}>Produkty:</Text>
                    {order.products.map((product, index) => (
                        <View key={index} style={simpleStyles.row}>
                            <Text style={simpleStyles.label}>{product.name}</Text>
                            <Text style={simpleStyles.value}>{(product.price * product.quantityInOrder).toFixed(2)} zl</Text>
                        </View>
                    ))}
                </View>
                <View style={simpleStyles.section}>
                    <Text style={simpleStyles.total}>Razem: {total.toFixed(2)} zl</Text>
                </View>
            </Page>
        </Document>
    );
};

export default InvoiceDocument;