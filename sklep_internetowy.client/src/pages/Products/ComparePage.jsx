import React from 'react';
import { Container } from 'react-bootstrap';

function ComparePage({ comparison }) {
    return (
        <Container className="my-5">
            <h1 className="mb-4">Product Comparison</h1>
            <p>This page is under construction. Selected IDs: {comparison.compareItems.join(', ')}</p>
        </Container>
    );
}

export default ComparePage;