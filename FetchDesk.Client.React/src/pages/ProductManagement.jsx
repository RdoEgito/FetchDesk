import { useEffect, useState } from "react";
import { apiFetch, apiGetJson, formatCurrency } from "../api";

function emptyProductModel() {
  return { id: "", name: "", currentPrice: 0, isActive: true };
}

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [productModel, setProductModel] = useState(emptyProductModel());
  const [isEditing, setIsEditing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  async function loadProductsAsync() {
    try {
      const response = await apiGetJson("/products");
      const orderedProducts = (response?.products ?? [])
        .slice()
        .sort((a, b) => (Number(b.isActive) - Number(a.isActive) || a.name.localeCompare(b.name)));
      setProducts(orderedProducts);
    } catch (error) {
      setFeedbackMessage(`Erro ao carregar os produtos: ${error.message}`);
    }
  }

  async function saveProductAsync(event) {
    event.preventDefault();
    setFeedbackMessage("");
    try {
      let response;
      if (isEditing) {
        response = await apiFetch(`/products/${productModel.id}`, {
          method: "PUT",
          body: JSON.stringify({
            name: productModel.name,
            currentPrice: Number(productModel.currentPrice),
            isActive: Boolean(productModel.isActive),
          }),
        });
      } else {
        response = await apiFetch("/products", {
          method: "POST",
          body: JSON.stringify({
            name: productModel.name,
            currentPrice: Number(productModel.currentPrice),
          }),
        });
      }

      if (response.ok) {
        setFeedbackMessage(isEditing ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!");
        cancelEdit();
        await loadProductsAsync();
      } else {
        setFeedbackMessage("Erro ao salvar o produto.");
      }
    } catch (error) {
      setFeedbackMessage(`Erro de conexão: ${error.message}`);
    }
  }

  function editProduct(product) {
    setIsEditing(true);
    setProductModel({
      id: product.id,
      name: product.name,
      currentPrice: product.currentPrice,
      isActive: product.isActive,
    });
    setFeedbackMessage("");
  }

  async function deleteProductAsync(id) {
    setFeedbackMessage("");
    try {
      const response = await apiFetch(`/products/${id}`, { method: "DELETE" });
      if (response.ok) {
        setFeedbackMessage("Produto desativado com sucesso!");
        await loadProductsAsync();
      } else {
        setFeedbackMessage("Erro ao desativar o produto.");
      }
    } catch (error) {
      setFeedbackMessage(`Erro de conexão: ${error.message}`);
    }
  }

  function cancelEdit() {
    setIsEditing(false);
    setProductModel(emptyProductModel());
    setFeedbackMessage("");
  }

  useEffect(() => {
    loadProductsAsync();
  }, []);

  return (
    <div className="container-fluid p-3">
      <h2 className="mb-4">Gestão de Cardápio</h2>

      <div className="row">
        <div className="col-12 col-md-4 mb-4">
          <div className="card shadow-sm border-0">
            <div className={`card-header ${isEditing ? "bg-warning" : "bg-primary"} text-white`}>
              <h5 className="mb-0">{isEditing ? "Editar Produto" : "Novo Produto"}</h5>
            </div>
            <div className="card-body">
              <form onSubmit={saveProductAsync}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Nome</label>
                  <input
                    className="form-control"
                    value={productModel.name}
                    onChange={(event) => setProductModel((c) => ({ ...c, name: event.target.value }))}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Preço (R$)</label>
                  <input
                    className="form-control"
                    type="number"
                    step="0.01"
                    min="0"
                    value={productModel.currentPrice}
                    onChange={(event) =>
                      setProductModel((c) => ({ ...c, currentPrice: event.target.valueAsNumber || 0 }))
                    }
                    required
                  />
                </div>

                {isEditing ? (
                  <div className="form-check form-switch mb-4">
                    <input
                      className="form-check-input"
                      id="isActiveSwitch"
                      type="checkbox"
                      checked={productModel.isActive}
                      onChange={(event) =>
                        setProductModel((c) => ({ ...c, isActive: event.target.checked }))
                      }
                    />
                    <label className="form-check-label" htmlFor="isActiveSwitch">
                      Ativo (Aparece no Caixa)
                    </label>
                  </div>
                ) : null}

                <div className="d-grid gap-2">
                  <button type="submit" className={`btn ${isEditing ? "btn-warning" : "btn-primary"} text-white fw-bold`}>
                    <i className="bi bi-save me-2" /> Salvar
                  </button>
                  {isEditing ? (
                    <button type="button" className="btn btn-outline-secondary" onClick={cancelEdit}>
                      Cancelar Edição
                    </button>
                  ) : null}
                </div>
              </form>

              {feedbackMessage ? <div className="alert alert-info mt-3 mb-0 text-center">{feedbackMessage}</div> : null}
            </div>
          </div>
        </div>

        <div className="col-12 col-md-8">
          <div className="card shadow-sm border-0">
            <div className="card-body p-0">
              <table className="table table-striped table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th className="ps-3">Produto</th>
                    <th className="text-end">Preço Atual</th>
                    <th className="text-center">Status</th>
                    <th className="text-center pe-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center p-4 text-muted">
                        Nenhum produto cadastrado.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td className="ps-3 fw-bold">{product.name}</td>
                        <td className="text-end">{formatCurrency(product.currentPrice)}</td>
                        <td className="text-center">
                          {product.isActive ? (
                            <span className="badge bg-success">Ativo</span>
                          ) : (
                            <span className="badge bg-secondary">Inativo</span>
                          )}
                        </td>
                        <td className="text-center pe-3">
                          <button className="btn btn-sm btn-outline-primary me-2" title="Editar" onClick={() => editProduct(product)}>
                            <i className="bi bi-pencil" />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Excluir"
                            onClick={() => deleteProductAsync(product.id)}
                            disabled={!product.isActive}
                          >
                            <i className="bi bi-trash" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
