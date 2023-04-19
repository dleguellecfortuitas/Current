import { hooks } from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import compareProducts from './global/compare-products';
import FacetedSearch from './common/faceted-search';
import rootsLoaded from './roots/category';
import { createTranslationDictionary } from '../theme/common/utils/translations-utils';

export default class Category extends CatalogPage {
    constructor(context) {
        super(context);
        this.validationDictionary = createTranslationDictionary(context);
    }

    setLiveRegionAttributes($element, roleType, ariaLiveStatus) {
        $element.attr({
            role: roleType,
            'aria-live': ariaLiveStatus,
        });
    }

    makeShopByPriceFilterAccessible() {
        if (!$('[data-shop-by-price]').length) return;

        if ($('.navList-action').hasClass('is-active')) {
            $('a.navList-action.is-active').focus();
        }

        $('a.navList-action').on('click', () => this.setLiveRegionAttributes($('span.price-filter-message'), 'status', 'assertive'));
    }

    onReady() {
        this.arrangeFocusOnSortBy();

        $('[data-button-type="add-cart"]').on('click', (e) => this.setLiveRegionAttributes($(e.currentTarget).next(), 'status', 'polite'));

        this.makeShopByPriceFilterAccessible();

        compareProducts(this.context);

        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }
        rootsLoaded();

        $('a.reset-btn').on('click', () => this.setLiveRegionsAttributes($('span.reset-message'), 'status', 'polite'));

        this.ariaNotifyNoProducts();
    }

    ariaNotifyNoProducts() {
        const $noProductsMessage = $('[data-no-products-notification]');
        if ($noProductsMessage.length) {
            $noProductsMessage.focus();
        }
    }

    initFacetedSearch() {
        const {
            price_min_evaluation: onMinPriceError,
            price_max_evaluation: onMaxPriceError,
            price_min_not_entered: minPriceNotEntered,
            price_max_not_entered: maxPriceNotEntered,
            price_invalid_value: onInvalidPrice,
        } = this.validationDictionary;
        const $productListingContainer = $('#product-listing-container');
        const $facetedSearchContainer = $('#faceted-search-container');
        const productsPerPage = this.context.categoryProductsPerPage;
        const requestOptions = {
            config: {
                category: {
                    shop_by_price: true,
                    products: {
                        limit: productsPerPage,
                    },
                },
            },
            template: {
                //productListing:  (($productListingContainer.hasClass('table')) ? 'category/product-listing2' : 'category/product-listing') ,
                productListing:  'category/product-listing' ,
                sidebar: 'category/sidebar',
            },
            showMore: 'category/show-more',
        };
 
        this.facetedSearch = new FacetedSearch(requestOptions, (content) => {
            $productListingContainer.html(content.productListing);
            $facetedSearchContainer.html(content.sidebar);
            $('body').triggerHandler('compareReset');
            customerJWT('8soiix25iux4unpzykqy03e0vrpl3l9');
            //$('html, body').animate({
           //     scrollTop: 0,
         //   }, 100);
        }, {
            validationErrorMessages: {
                onMinPriceError,
                onMaxPriceError,
                minPriceNotEntered,
                maxPriceNotEntered,
                onInvalidPrice,
            },
        });
    
        const customerJWT = (apiAccountClientId) => {
            let resource = `/customer/current.jwt?app_client_id=${apiAccountClientId}`;
            return fetch(resource)
            .then(response => {
            if(response.status === 200) {
                return response.text();
            } else {
                return new Error(`response.status is ${response.status}`);
            }
            })
            .then(jwt => {
            if(jwt){
                var sku_list = $("[data-sku]");
                getPriceQuote(sku_list, jwt);
            }
            
            // decode...
            })
            .catch(error => console.error(error));
        };
        
        function getPriceQuote(productCards, token){
            const out_estimate = [];
            var item_id;
            var customer_id;
            var sale_date;
            var sale_quantity;

            //productCards.each( addPriceRequests(out_estimate));
            var d = new Date();
            var strDate = d.getFullYear() + "/" + (d.getMonth()+1) + "/" + d.getDate();
            for(var i = 0, max = productCards.length; i < max; i++){
                out_estimate.push({item_id:$(productCards[i]).data('sku').toString(), customer_id:99, sale_date:`${strDate}`,sale_quantity:1});
            }

            $.ajax({
                type: "POST",
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type':'application/json'
                },
                url: "https://chromtech-sync.azurewebsites.net/api/getPriceQuote",
                data: JSON.stringify(out_estimate),
                contentType: 'application/json; charset=utf-8',
                dataType: "json",
                success: function (result, status, xhr) {
                    var resp_data = JSON.parse(xhr.responseText);
                    for(var i = 0, max = resp_data.length; i < max; i++){
                        // var msrp = $("[data-sku='" + out_estimate[i].item_id + "'] .non-sale-price--withoutTax" );
                        // msrp.text("$" + resp_data[i].Customer_price);

                        const dollars = new Intl.NumberFormat(`en-US`, {
                            currency: `USD`,
                            style: 'currency',
                        }).format(resp_data[i].Calculated_unit_price);

                        var price = $("[data-sku='" + out_estimate[i].item_id + "'] .price--withoutTax" );
                        price.text(dollars);
                    }
                },
                error: function (xhr, status, error) {
                    console.log("Error PriceQuote: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
                }
            });
            
        }
    }
}
