document.addEventListener('click', function (evt) {
  var button = evt.target.closest('.lp-card-add-side');
  if (!button) return;

  var variantId = button.dataset.variantId;
  if (!variantId) return;

  evt.preventDefault();
  if (button.getAttribute('aria-disabled') === 'true') return;

  var cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');

  var formData = new FormData();
  formData.append('id', variantId);
  formData.append('quantity', 1);
  if (cart) {
    formData.append(
      'sections',
      cart.getSectionsToRender().map(function (section) {
        return section.id;
      })
    );
    formData.append('sections_url', window.location.pathname);
  }

  var config = fetchConfig('javascript');
  delete config.headers['Content-Type'];
  config.body = formData;

  button.setAttribute('aria-disabled', 'true');
  button.classList.add('loading');

  fetch(routes.cart_add_url, config)
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      if (response.status) {
        console.error(response.description || response.message);
        return;
      }
      if (cart) {
        if (typeof publish === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
          publish(PUB_SUB_EVENTS.cartUpdate, {
            source: 'lux-pet-quick-add',
            productVariantId: variantId,
            cartData: response,
          });
        }
        cart.renderContents(response);
      } else {
        window.location = routes.cart_url;
      }
    })
    .catch(function (error) {
      console.error(error);
    })
    .finally(function () {
      button.removeAttribute('aria-disabled');
      button.classList.remove('loading');
    });
});
