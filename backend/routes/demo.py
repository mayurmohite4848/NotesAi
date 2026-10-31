import json
from flask import Blueprint, jsonify, request, current_app
try:
    from backend.db import (
        get_db_connection,
        create_note,
        get_all_notes,
        delete_note,
        create_notebook,
        get_all_notebooks,
        delete_notebook,
        add_notebook_page
    )
except ImportError:
    from db import (
        get_db_connection,
        create_note,
        get_all_notes,
        delete_note,
        create_notebook,
        get_all_notebooks,
        delete_notebook,
        add_notebook_page
    )

demo_bp = Blueprint("demo_bp", __name__)

SAMPLE_NOTE_1 = {
    "title": "Mathematical Foundations of Machine Learning",
    "tags": ["machine-learning", "math", "statistics", "demo"],
    "is_favorite": True,
    "ai_insights": {
        "core_concept": "Probabilistic Machine Learning & First-Order Optimization",
        "key_takeaways": [
            "Bayesian formulation calculates posterior probabilities via prior updates and likelihood functions.",
            "Gradient descent iteratively updates parameters along the steepest negative gradient.",
            "Multivariate Gaussian density generalizes the 1D bell curve across covariance matrices."
        ]
    },
    "content": """# Mathematical Foundations of Machine Learning

## 1. Bayes' Theorem & Conditional Probability
Bayes' Theorem provides a principled framework for updating the probability of a hypothesis $A$ given observed evidence $B$:
$$P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}$$

Where:
* $P(A|B)$: **Posterior probability** of hypothesis $A$ given evidence $B$.
* $P(B|A)$: **Likelihood** of observing evidence $B$ if hypothesis $A$ is true.
* $P(A)$: **Prior probability** of hypothesis $A$ before seeing evidence.
* $P(B)$: **Marginal likelihood** (evidence normalizer), computed as $\\sum_{i} P(B|A_i)P(A_i)$.

## 2. Gradient Descent Parameter Optimization
In stochastic gradient descent (SGD), model weights $\\theta$ are iteratively updated along the negative gradient of the loss function $L$:
$$\\theta_{t+1} = \\theta_t - \\eta \\nabla_\\theta L(\\theta_t)$$

Where:
* $\\eta > 0$ denotes the **learning rate** hyperparameter.
* $\\nabla_\\theta L(\\theta_t)$ is the vector of first-order partial derivatives.

## 3. Multivariate Gaussian Probability Density
For a continuous random vector $X = [X_1, X_2, \\dots, X_d]^T \\sim \\mathcal{N}(\\mu, \\Sigma)$:
$$f(x) = \\frac{1}{(2\\pi)^{d/2} |\\Sigma|^{1/2}} \\exp\\left( -\\frac{1}{2} (x - \\mu)^T \\Sigma^{-1} (x - \\mu) \\right)$$

* $\\mu \\in \\mathbb{R}^d$ is the mean center vector.
* $\\Sigma \\in \\mathbb{R}^{d \\times d}$ is the symmetric positive semi-definite covariance matrix.
* $|\\Sigma|$ denotes the matrix determinant, capturing multidimensional variance scale.
"""
}

SAMPLE_NOTE_2 = {
    "title": "Distributed Event-Driven Cloud Architecture",
    "tags": ["system-design", "architecture", "microservices", "demo"],
    "is_favorite": True,
    "ai_insights": {
        "core_concept": "High-Throughput Asynchronous Microservices System",
        "key_takeaways": [
            "Decouples client ingestion requests from heavy OCR and PDF batch workers via Apache Kafka.",
            "Employs Redis semantic caching for sub-millisecond retrieval of common vector queries.",
            "Self-healing fallback routes to local PyTorch models during upstream cloud outages."
        ]
    },
    "content": """# Distributed Event-Driven Cloud Architecture

An enterprise cloud architecture built for high-throughput multimodal document ingestion, federated RAG retrieval, and zero-downtime fallback execution.

```mermaid
graph TD
    Client([Web & Mobile Clients]) -->|HTTPS / WSS| APIGW[API Gateway & Rate Limiter]
    APIGW -->|JWT Validation| AuthSvc[Authentication Service]
    APIGW -->|Async Batch Upload| IngestWorker[Document Ingestion Dispatcher]
    APIGW -->|Realtime Chat Query| RAGEngine[2-Tier Grounded RAG Service]
    
    IngestWorker -->|Publish Event| KafkaQueue[(Apache Kafka Event Bus)]
    KafkaQueue --> WorkerPool[PyTorch EasyOCR & KaTeX Workers]
    WorkerPool --> CloudStore[(Decoupled S3 / Cloudinary Bucket)]
    WorkerPool --> MainDB[(Persistent SQLite / PostgreSQL)]
    
    RAGEngine --> RedisCache[(Redis Semantic Query Cache)]
    RAGEngine --> ModelRouter{Autonomous Model Router}
    ModelRouter -->|Primary Route| GeminiCloud[Gemini 2.5 Flash Multimodal]
    ModelRouter -->|Zero-Downtime Fallback| LocalPyTorch[Local Quantized PyTorch Engine]
    
    GeminiCloud -.-> TelemetryLog[(LLMOps Telemetry DB)]
    LocalPyTorch -.-> TelemetryLog
```

## System Design Highlights
1. **Asynchronous Ingestion**: Multi-page PDF uploads and handwriting batches are pushed to the message broker, returning a job ticket immediately to prevent HTTP timeouts.
2. **Sub-Millisecond Semantic Cache**: Frequently queried study summaries and math proofs are cached in Redis to achieve sub-millisecond response latency.
3. **Autonomous Hybrid Fallback Engine**: If cloud API rate limits (HTTP 429) or upstream outages occur, the router gracefully degrades to the local PyTorch engine without user disruption.
"""
}

SAMPLE_NOTEBOOK = {
    "title": "Deep Learning & Neural Network Foundations",
    "subject_tag": "Deep Learning",
    "description": "Comprehensive 3-page study notebook covering backpropagation calculus, convolutional neural networks, and Transformer self-attention with live LaTeX and diagrams.",
    "cover_color": "#6366f1",
    "is_favorite": True,
    "pages": [
        {
            "page_number": 1,
            "title": "Perceptrons & The Backpropagation Algorithm",
            "content": """# Perceptrons & The Backpropagation Algorithm

## 1. Non-Linear Activation Functions
Neural networks introduce non-linearities to approximate arbitrary continuous functions:
* **Sigmoid Activation**:
$$\\sigma(z) = \\frac{1}{1 + e^{-z}}$$
* **ReLU (Rectified Linear Unit)**:
$$f(x) = \\max(0, x)$$
* **Leaky ReLU**:
$$f(x) = \\max(\\alpha x, x), \\quad \\text{where } \\alpha \\approx 0.01$$

## 2. Gradient Propagation via Chain Rule
In multi-layer feedforward networks, error gradients with respect to hidden layer weight $w_{ij}$ are derived via the multivariate chain rule:
$$\\frac{\\partial L}{\\partial w_{ij}} = \\frac{\\partial L}{\\partial a_j} \\cdot \\frac{\\partial a_j}{\\partial z_j} \\cdot \\frac{\\partial z_j}{\\partial w_{ij}}$$

Where $z_j = \\sum_i w_{ij} a_i + b_j$ and $a_j = \\sigma(z_j)$.
Backpropagation computes all layer gradients in $O(W)$ operations, where $W$ is the total count of network parameters.
"""
        },
        {
            "page_number": 2,
            "title": "Convolutional Networks & Feature Extraction",
            "content": """# Convolutional Networks & Feature Extraction

Convolutional layers preserve spatial 2D relationships in images by sliding shared parameterized kernels across input tensors.

```mermaid
graph LR
    Input[Input Image: 224x224x3] --> Conv1[Conv2D: 64 Filters, 3x3]
    Conv1 --> Act1[ReLU Activation]
    Act1 --> Pool1[MaxPool2D: 2x2, Stride 2]
    Pool1 --> Conv2[Conv2D: 128 Filters, 3x3]
    Conv2 --> Flat[Flatten Vector]
    Flat --> Dense[Dense Linear: 512 Units]
    Dense --> Softmax[Softmax Classifier: 10 Classes]
```

## Spatial Dimension Calculation Formula
Given input spatial dimension $W$, filter kernel size $K$, padding $P$, and stride $S$, the output dimension $O$ is:
$$O = \\left\\lfloor \\frac{W - K + 2P}{S} \\right\\rfloor + 1$$

* **Padding ($P$)**: Prevents spatial shrinkage at boundary pixels.
* **Stride ($S$)**: Downsamples activation maps to reduce computational overhead.
"""
        },
        {
            "page_number": 3,
            "title": "Transformers & Scaled Dot-Product Attention",
            "content": """# Transformers & Scaled Dot-Product Attention

The Transformer architecture eliminates recurrence, using attention mechanisms to process all sequence tokens simultaneously.

## 1. Scaled Dot-Product Attention
Given packed queries $Q$, keys $K$, and values $V$:
$$Attention(Q, K, V) = \\text{softmax}\\left( \\frac{QK^T}{\\sqrt{d_k}} \\right) V$$

* **Dot-Product Compatibility**: $QK^T$ evaluates pairwise token similarity scores.
* **Scaling Factor $\\frac{1}{\\sqrt{d_k}}$**: Prevents the dot product from pushing the softmax function into regions with near-zero gradients.
* **Softmax Normalization**: Produces attention weights that sum to $1.0$ across each row.

## 2. Multi-Head Attention Form
Multi-head attention allows the model to jointly attend to information from different representation subspaces:
$$\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, \\dots, \\text{head}_h) W^O$$
Where $\\text{head}_i = Attention(Q W_i^Q, K W_i^K, V W_i^V)$.
"""
        }
    ]
}

@demo_bp.route("/api/demo/seed", methods=["POST"])
def seed_demo_samples():
    """
    Seeds comprehensive, production-quality demo notes and multi-page notebooks
    with LaTeX math formulas and Mermaid architecture diagrams.
    """
    try:
        db_path = current_app.config.get("DATABASE_PATH")
        
        # 1. Clear any existing demo-tagged notes & notebooks to allow idempotent re-seeding
        existing_notes = get_all_notes(tag="demo", db_path=db_path)
        for n in existing_notes:
            delete_note(n["id"], db_path=db_path)

        existing_notebooks = get_all_notebooks(search="Deep Learning & Neural Network Foundations", db_path=db_path)
        for nb in existing_notebooks:
            delete_notebook(nb["id"], db_path=db_path)

        # 2. Create Sample Note 1 (Math & LaTeX)
        note_1 = create_note(
            title=SAMPLE_NOTE_1["title"],
            content=SAMPLE_NOTE_1["content"],
            extracted_text=SAMPLE_NOTE_1["content"],
            tags=SAMPLE_NOTE_1["tags"],
            ai_insights=SAMPLE_NOTE_1["ai_insights"],
            is_favorite=SAMPLE_NOTE_1["is_favorite"],
            db_path=db_path
        )

        # 3. Create Sample Note 2 (System Architecture & Mermaid)
        note_2 = create_note(
            title=SAMPLE_NOTE_2["title"],
            content=SAMPLE_NOTE_2["content"],
            extracted_text=SAMPLE_NOTE_2["content"],
            tags=SAMPLE_NOTE_2["tags"],
            ai_insights=SAMPLE_NOTE_2["ai_insights"],
            is_favorite=SAMPLE_NOTE_2["is_favorite"],
            db_path=db_path
        )

        # 4. Create Multi-Page Notebook (3 Pages with Math, Mermaid & Grounded RAG content)
        notebook = create_notebook(
            title=SAMPLE_NOTEBOOK["title"],
            description=SAMPLE_NOTEBOOK["description"],
            subject_tag=SAMPLE_NOTEBOOK["subject_tag"],
            cover_color=SAMPLE_NOTEBOOK["cover_color"],
            is_favorite=SAMPLE_NOTEBOOK["is_favorite"],
            db_path=db_path
        )

        created_pages = []
        for p in SAMPLE_NOTEBOOK["pages"]:
            page = add_notebook_page(
                notebook_id=notebook["id"],
                title=p["title"],
                content=p["content"],
                page_number=p["page_number"],
                db_path=db_path
            )
            created_pages.append(page)

        return jsonify({
            "success": True,
            "message": "Demo sample notes and 3-page research notebook successfully loaded!",
            "notes": [note_1, note_2],
            "notebook": {
                **notebook,
                "pages": created_pages,
                "page_count": len(created_pages)
            }
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to seed demo samples: {str(e)}"
        }), 500

@demo_bp.route("/api/demo/clear", methods=["DELETE"])
def clear_demo_samples():
    """Removes all demo-tagged notes and sample notebooks."""
    try:
        db_path = current_app.config.get("DATABASE_PATH")
        existing_notes = get_all_notes(tag="demo", db_path=db_path)
        removed_notes = 0
        for n in existing_notes:
            delete_note(n["id"], db_path=db_path)
            removed_notes += 1

        existing_notebooks = get_all_notebooks(search="Deep Learning & Neural Network Foundations", db_path=db_path)
        removed_notebooks = 0
        for nb in existing_notebooks:
            delete_notebook(nb["id"], db_path=db_path)
            removed_notebooks += 1

        return jsonify({
            "success": True,
            "message": f"Cleared {removed_notes} demo note(s) and {removed_notebooks} demo notebook(s)."
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to clear demo samples: {str(e)}"
        }), 500
