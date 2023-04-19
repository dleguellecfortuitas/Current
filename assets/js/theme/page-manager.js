export default class PageManager {
    constructor(context) {
        this.context = context;
    }

    type() {
        return this.constructor.name;
    }

    onReady() {
    }


    static load(context) {
        const page = new this(context);

        $(document).ready(() => {
            page.onReady.bind(page)();
            customerJWT('8soiix25iux4unpzykqy03e0vrpl3l9');
            console.log("Data: ");
            //$.when(customerJWT('8soiix25iux4unpzykqy03e0vrpl3l9')).done(function (jwt) {
                //var sku_list = $("[data-sku]");
                //getPriceQuote(sku_list, jwt);
              //});
   //         setPrice('8soiix25iux4unpzykqy03e0vrpl3l9');
  //          $.get(`/customer/current.jwt?app_client_id=8soiix25iux4unpzykqy03e0vrpl3l9`, function(data, status){
  //              var sku_list = $("[data-sku]");
   //             if(status === 200) {
   //                 alert("Data: " + data + "\nStatus: " + status);
   //                 getPriceQuote(sku_list, data);
  //              }
                //alert("Data: " + data + "\nStatus: " + status);
    //          });
        });
    }

}

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
    for(var i = 0, max = productCards.length; i < max; i++) 
    {
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
            for(var i = 0, max = resp_data.length; i < max; i++) 
            {
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
