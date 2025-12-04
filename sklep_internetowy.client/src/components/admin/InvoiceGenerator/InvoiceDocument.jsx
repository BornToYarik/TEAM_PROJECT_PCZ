import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Регистрируем шрифт (опционально, если нужны спецсимволы, но для старта хватит стандартного)
// Font.register({ family: 'Roboto', src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf' });

const styles = StyleSheet.create({
    page: { flexDirection: 'column', backgroundColor: '#FFFFFF', padding: 30 },
    section: { margin: 10, padding: 10, flexGrow: 1 },
    header: { fontSize: 24, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
    row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 5, marginBottom: 5 },
    label: { width: '60%', fontSize: 12 },
    value: { width: '40%', fontSize: 12, textAlign: 'right' },
    total: { marginTop: 20, fontSize: 14, textAlign: 'right', fontWeight: 'bold' }
});

// Компонент самого документа
const InvoiceDocument = ({ order }) => {
    // Считаем сумму (если она не приходит с бэка)
    const total = order.products.reduce((sum, p) => sum + (p.price * p.quantityInOrder), 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Заголовок */}
                <View style={styles.section}>
                    <Text style={styles.header}>Invoice #{order.id}</Text>
                    <Text style={{ fontSize: 12, marginBottom: 10 }}>Client: {order.userEmail}</Text>
                    <Text style={{ fontSize: 12, marginBottom: 20 }}>Status: {order.status}</Text>
                </View>

                {/* Таблица товаров */}
                <View style={styles.section}>
                    <Text style={{ fontSize: 14, marginBottom: 10, borderBottomWidth: 2 }}>Products:</Text>

                    {order.products.map((product, index) => (
                        <View key={index} style={styles.row}>
                            <Text style={styles.label}>
                                {product.name} ({product.quantityInOrder} x {product.price} zl)
                            </Text>
                            <Text style={styles.value}>
                                {(product.price * product.quantityInOrder).toFixed(2)} zl
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Итого */}
                <View style={styles.section}>
                    <Text style={styles.total}>(Total): {total.toFixed(2)} zl</Text>
                </View>
            </Page>
        </Document>
    );
};

export default InvoiceDocument;