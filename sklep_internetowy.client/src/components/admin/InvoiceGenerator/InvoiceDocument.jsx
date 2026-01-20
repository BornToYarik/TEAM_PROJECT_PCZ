import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },

    headerContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20 },
    headerTitle: { fontSize: 32, letterSpacing: 2 },

    divider: { borderBottomWidth: 1, borderBottomColor: '#AAAAAA', marginBottom: 20 },

    infoContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    infoColumnLeft: { width: '50%' },
    infoColumnRight: { width: '40%', alignItems: 'flex-end' },

    label: { color: '#666', fontSize: 9, marginBottom: 2, fontWeight: 'bold' },
    text: { fontSize: 10, marginBottom: 4 },
    textBold: { fontSize: 10, fontWeight: 'bold', marginBottom: 4 },

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

    totalsContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
    totalsBlock: { width: '40%' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    grandTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        paddingTop: 5,
        marginTop: 5
    },
    grandTotalText: { fontSize: 12, fontWeight: 'bold' }
});

export const InvoiceDocument = ({ order }) => {

    const products = order.products.map(p => {
        const price = Number(p.price) || 0;
        const quantity = Number(p.quantityInOrder) || 1;

        return {
            ...p,
            price,
            quantityInOrder: quantity,
            lineTotal: price * quantity
        };
    });

    const subtotal = products.reduce((sum, p) => sum + p.lineTotal, 0);
    const taxRate = 0.23;
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
                    <Text style={styles.headerTitle}>INVOICE</Text>
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.infoColumnLeft}>
                        <Text style={styles.label}>ISSUED TO:</Text>
                        <Text style={styles.textBold}>{order.userEmail}</Text>
                        <Text style={styles.text}>Client ID: {order.userId}</Text>
                        <Text style={styles.text}>Ul. Klienta 12/3</Text>
                        <Text style={styles.text}>00-001 Warszawa, Poland</Text>

                        <Text style={[styles.label, { marginTop: 15 }]}>PAY TO:</Text>
                        <Text style={styles.textBold}>TechShop Sp. z o.o.</Text>
                        <Text style={styles.text}>Bank: mBank Polska</Text>
                        <Text style={styles.text}>Account: PL 12 3456 7890 0000 0000</Text>
                    </View>

                    <View style={styles.infoColumnRight}>
                        <Text>INVOICE NO: #{order.id}</Text>
                        <Text>DATE: {today}</Text>
                        <Text>DUE DATE: {dueDate.toLocaleDateString()}</Text>
                        <Text>STATUS: {order.status}</Text>
                    </View>
                </View>

                <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.colDesc}>DESCRIPTION</Text>
                        <Text style={styles.colPrice}>UNIT PRICE</Text>
                        <Text style={styles.colQty}>QTY</Text>
                        <Text style={styles.colTotal}>TOTAL</Text>
                    </View>

                    {products.map((p, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.colDesc}>{p.name}</Text>
                            <Text style={styles.colPrice}>{p.price.toFixed(2)}</Text>
                            <Text style={styles.colQty}>{p.quantityInOrder}</Text>
                            <Text style={styles.colTotal}>{p.lineTotal.toFixed(2)}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.totalsContainer}>
                    <View style={styles.totalsBlock}>
                        <View style={styles.totalRow}>
                            <Text>SUBTOTAL</Text>
                            <Text>{subtotal.toFixed(2)} $</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text>TAX (23%)</Text>
                            <Text>{taxAmount.toFixed(2)} $</Text>
                        </View>
                        <View style={styles.grandTotal}>
                            <Text style={styles.grandTotalText}>TOTAL</Text>
                            <Text style={styles.grandTotalText}>{total.toFixed(2)} $</Text>
                        </View>
                    </View>
                </View>

            </Page>
        </Document>
    );
};

export default InvoiceDocument;
