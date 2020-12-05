<?php

function apicall($card, $set) {
   $method             = "GET";
   $encodedCard = urlencode($card);
   
   $url = "https://api.cardmarket.com/ws/v1.1/output.json/products/{$encodedCard}/1/1/false";
   $appToken           = "CYMaAwKy3uU4KI1y";
   $appSecret          = "GrE91UXj2HYIzLTEAhX24nr9SwROOJHy";
   $accessToken        = "cNxTwQDBOIlUU9csRkea1TH8yn2EoMkh";
   $accessSecret       = "prKYuzzAHCcijBaf2bDJrKq1aM2xLBgh";
   $nonce              = uniqid();
   $timestamp          = time();
   $signatureMethod    = "HMAC-SHA1";
   $version            = "1.0";
   
   /**
    * Gather all parameters that need to be included in the Authorization header and are know yet
    *
    * Attention: If you have query parameters, they MUST also be part of this array!
    *
    * @var $params array|string[] Associative array of all needed authorization header parameters
    */
   $params             = array(
       'realm'                     => $url,
       'oauth_consumer_key'        => $appToken,
       'oauth_token'               => $accessToken,
       'oauth_nonce'               => $nonce,
       'oauth_timestamp'           => $timestamp,
       'oauth_signature_method'    => $signatureMethod,
       'oauth_version'             => $version,
     //  'search' => 'Jeweled',
       
   );
   
   /**
    * Start composing the base string from the method and request URI
    *
    * Attention: If you have query parameters, don't include them in the URI
    *
    * @var $baseString string Finally the encoded base string for that request, that needs to be signed
    */
   $baseString         = strtoupper($method) . "&";
   $baseString        .= rawurlencode($url) . "&";
   
   /*
    * Gather, encode, and sort the base string parameters
    */
   $encodedParams      = array();
   foreach ($params as $key => $value)
   {
       if ("realm" != $key)
       {
           $encodedParams[rawurlencode($key)] = rawurlencode($value);
       }
   }
   ksort($encodedParams);
   
   /*
    * Expand the base string by the encoded parameter=value pairs
    */
   $values             = array();
   foreach ($encodedParams as $key => $value)
   {
       $values[] = $key . "=" . $value;
   }
   $paramsString       = rawurlencode(implode("&", $values));
   $baseString        .= $paramsString;
   
   /*
    * Create the signingKey
    */
   $signatureKey       = rawurlencode($appSecret) . "&" . rawurlencode($accessSecret);
   
   /**
    * Create the OAuth signature
    * Attention: Make sure to provide the binary data to the Base64 encoder
    *
    * @var $oAuthSignature string OAuth signature value
    */
   $rawSignature       = hash_hmac("sha1", $baseString, $signatureKey, true);
   $oAuthSignature     = base64_encode($rawSignature);
   
   /*
    * Include the OAuth signature parameter in the header parameters array
    */
   $params['oauth_signature'] = $oAuthSignature;
   
   /*
    * Construct the header string
    */
   $header             = "Authorization: OAuth ";
   $headerParams       = array();
   foreach ($params as $key => $value)
   {
       $headerParams[] = $key . "=\"" . $value . "\"";
   }
   $header            .= implode(", ", $headerParams);

   /*
    * Get the cURL handler from the library function
    */
   $curlHandle         = curl_init();
   
   /*
    * Set the required cURL options to successfully fire a request to MKM's API
    *
    * For more information about cURL options refer to PHP's cURL manual:
    * http://php.net/manual/en/function.curl-setopt.php
    */
   curl_setopt($curlHandle, CURLOPT_RETURNTRANSFER, true);
   curl_setopt($curlHandle, CURLOPT_URL, $url);
   curl_setopt($curlHandle, CURLOPT_HTTPHEADER, array($header));
   curl_setopt($curlHandle, CURLOPT_SSL_VERIFYPEER, false);
   
   /**
    * Execute the request, retrieve information about the request and response, and close the connection
    *
    * @var $content string Response to the request
    * @var $info array Array with information about the last request on the $curlHandle
    */
   $content            = curl_exec($curlHandle);
   $info               = curl_getinfo($curlHandle);
   curl_close($curlHandle);
   
   /*
    * Convert the response string into an object
    *
    * If you have chosen XML as response format (which is standard) use simplexml_load_string
    * If you have chosen JSON as response format use json_decode
    *
    * @var $decoded \SimpleXMLElement|\stdClass Converted Object (XML|JSON)
    */
   $decoded            = json_decode($content, true);
   //$decoded            = simplexml_load_string($content);

   if (isset($decoded['product']) && $decoded['product']) {
    //    var_dump($card);
    //    echo '<br>';
    //    echo '<br>';
    //    echo '<br>';
       foreach ($decoded['product'] as $product) {
        //     echo '<br>';   
        //     var_dump($product);
        //    echo '<br>';
        //    echo json_encode($product);
        //    echo '<br>';
        // var_dump($product['expansion']);
        // echo '<br>';
        // var_dump($set);
        // echo '<br>';
        // var_dump(str_replace(' Edition', '', $set));
        // echo '<br>';
        // var_dump($product['expansion'] === $set);
        // echo '<br>';
        // var_dump($product['expension'] === str_replace(' Edition', '', $set));
        // echo '<br>';
        // var_dump(mb_strtolower($product['expension']) == mb_strtolower(str_replace(' Edition', '', $set)));
        // echo '<br>';
        // var_dump($product['expansion'] . ' Edition' === $set);
        // echo '<br>';
        // echo '<br>';
        // echo '<br>';

             if ($product['expansion'] === $set ||
                    ($product['expansion'] . ' Edition' === $set) ||
                    ('Classic ' . $product['expansion'] === $set) ||
                    ($product['expansion'] === 'Magic 2015' && $set === 'Magic 2015 Core Set') ||
                    ($product['expansion'] === 'Core 2019' && $set === 'Core Set 2019')
                ) {
                echo '<br><br>' . $card . ' ('.$set.')';
                echo '<br> TREND => ' . $product['priceGuide']['TREND'];
                // echo '<br> 7 day => ' . $product['priceGuide']['SELL'];
                // echo '<br> LOW => ' . $product['priceGuide']['LOW'];

                return [
                    $product['priceGuide']['TREND'],
                    $product['priceGuide']['SELL'],
                    $product['priceGuide']['LOW'],
                    $product['priceGuide']['TRENDFOIL'] ?? '',
                    $product['priceGuide']['LOWFOIL'] ?? '',
                ];

            }
       }

       echo '<br>';
       echo '---------------------------------------------------';
       echo '<br>';
       echo '<br>';
       echo '<br>';
   }
   
   echo '<BR><strong>Nothing found for ' . $card . '('.$set.')</strong><br>';
   if (isset($decoded['product']) && $decoded['product']) {
        echo json_encode($decoded['product']);
        echo '<br><br>';
   } else {
        // echo json_encode($decoded);
        // echo '<br><br>';
        // var_dump($content);
        // echo '<br><br>';
        // var_dump($info);
        // echo '<br><br>';
   }
   
}
$row = 0;
$calls = 0;
$rows = [];
if (($handle = fopen("cards2.csv", "r")) !== FALSE) {
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        //$num = count($data);
        //echo "<p> $num fields in line $row: <br /></p>\n";

        if ($row > 0 && $calls < 100 && empty($data[15])) {
            if ($prices = apicall($data[3], $data[4])) {
                $data[15] = $prices[0];
                $data[16] = $prices[1];
                $data[17] = $prices[2];
                $data[18] = $prices[3];
                $data[19] = $prices[4];
            }
            $calls++;
        }


        $rows[] = $data;

        $row++;
        // for ($c=0; $c < $num; $c++) {
        //     echo $data[$c] . "<br />\n";
        // }

        
    }
    fclose($handle);
}

$fp = fopen('cards2.csv', 'w');
foreach ($rows as $row) {
    fputcsv($fp, $row);
}

fclose($fp);

// $card = "Jeweled Bird";
// $set = "Arabian Nights";

// apicall($card, $set);