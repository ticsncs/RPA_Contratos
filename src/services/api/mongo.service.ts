/**
   async uploadToApi(filePath: string): Promise<void> {
     logger.info('Uploading exported file to API');
     
     try {
       const fileName = path.basename(filePath);
       const form = new FormData();
       
       form.append('file', fs.createReadStream(filePath));
       form.append('file_name', fileName);
       
       const apiUrl = `${config.apiMongoUrl}1.0/odoo/contracts`;
    /**
     * Sends a POST request to the specified API URL with the provided form data.
     *
     * @async
     * @function
     * @param {string} apiUrl - The URL of the API endpoint to send the request to.
     * @param {FormData} form - The form data to be sent in the request body.
     * @returns {Promise<AxiosResponse>} A promise that resolves to the response from the API.
     * @throws {AxiosError} Throws an error if the request fails.
     *
     * @example
     * const form = new FormData();
     * form.append('key', 'value');
     * const response = await axios.post(apiUrl, form, {
     *   headers: form.getHeaders(),
     * });
     * console.log(response.data);
     */
      /** const response = await axios.post(apiUrl, form, {
         headers: form.getHeaders(),
       });
       
       logger.success(`API response: ${JSON.stringify(response.data)}`);
       
       // Clean up the downloaded file
       fs.unlinkSync(filePath);
       logger.info(`Temporary file deleted: ${filePath}`);
     } catch (error) {
       logger.error('API upload failed', error);
       throw new Error('Upload to API failed');
     }
   }
 
*/