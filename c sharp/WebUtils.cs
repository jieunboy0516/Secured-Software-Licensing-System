using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace WebUtils
{
    public class testclass {
        [JsonProperty(PropertyName = "a")] public string a;

        [JsonProperty(PropertyName = "b")] public string b;
    }

    public static class WebUtils
    {


#if DEBUG
        public static string siteaddress = "http://localhost:5000";
#else
        public static string siteaddress = "http://localhost:5000";
#endif
        

        private static readonly HttpClient client = new HttpClient();


        private class PACKET
        {
            [JsonProperty(PropertyName = "payload")] public string paypload;

            [JsonProperty(PropertyName = "time")] public string time;
        }



        public static string encrypted_get_returnstring(string url, string decryptkey)
        {
            string res = Get(url);
            string decrypted = Crypto.Decrypt(res, decryptkey);
            return decrypted;
        }

        public static T encrypted_get_returnobject<T>(string url, string key)
        {
            string res = Get(url);
            string decrypted = Crypto.Decrypt(res, key);
            return JsonConvert.DeserializeObject<T>(decrypted);
        }
        public static string encrypted_post_returnstring<T>(string url, string encryptdatakey, T data, string encryptdatekey, string encryptpacketkey)
        {
            string seriallized_data = JsonConvert.SerializeObject(data);
            string encrypted_data = Crypto.Encrypt(seriallized_data, encryptdatakey);

            string time = get16charDate();
            string encrypted_time = Crypto.Encrypt(time, encryptdatekey);

            PACKET packet = new PACKET();
            packet.paypload = encrypted_data;
            packet.time = encrypted_time;
            string packet_string = JsonConvert.SerializeObject(packet);

            string encrypted_packet = Crypto.Encrypt(packet_string, encryptpacketkey);

            var dict = new Dictionary<string, string>
                {
                    { "asd", encrypted_packet }
                };
            string res = Post(dict, url);
            string decrypted = Crypto.Decrypt(res, time);
            return decrypted;
        }

        public static T2 encrypted_post_returnobject<T1,T2>(string url, string encryptdatakey, T1 data, string encryptdatekey, string encryptpacketkey)
        {
            string seriallized_data = JsonConvert.SerializeObject(data);
            string encrypted_data = Crypto.Encrypt(seriallized_data, encryptdatakey);

            string time = get16charDate();
            string encrypted_time = Crypto.Encrypt(time, encryptdatekey);

            PACKET packet = new PACKET();
            packet.paypload = encrypted_data;
            packet.time = encrypted_time;
            string packet_string = JsonConvert.SerializeObject(packet);

            string encrypted_packet = Crypto.Encrypt(packet_string, encryptpacketkey);

            var dict = new Dictionary<string, string>
                {
                    { "asd", encrypted_packet }
                };
            string res = Post(dict, url);
            string decrypted = Crypto.Decrypt(res, time);
            T2 t = JsonConvert.DeserializeObject<T2>(decrypted);
            return t;
        }


        public const string ServerErrorMessage = "server down, it might be in maintenance, see discord for information.";

        public static string Get(string uri)
        {
            try
            {

                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(uri);
                request.AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate;

                using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
                using (Stream stream = response.GetResponseStream())
                using (StreamReader reader = new StreamReader(stream))
                {
                    return reader.ReadToEnd();
                }

            }
            catch (Exception e)
            {
                MessageBox.Show(ServerErrorMessage);
                Process.GetCurrentProcess().Kill();
                return "fail";
            }


        }


        public static string Post(Dictionary<string, string> dict, string address)
        {
            try
            {

                var result =

                Task.Run(async () =>
                {

                    var content = new FormUrlEncodedContent(dict);

                    var response = await client.PostAsync(address, content);

                    var responseString = await response.Content.ReadAsStringAsync();

                    return responseString;

                }).Result;


                return result;

            }
            catch (Exception e)
            {
                MessageBox.Show(ServerErrorMessage);
                Process.GetCurrentProcess().Kill();
                return "fail";
            }


        }


        public static string get16charDate()
        {
            string date = DateTime.Now.ToString(@"123MM\/dd h\:mm tt");
            while (date.Length > 16) date = date.Remove(0, 1);
            while (date.Length < 16) date = "0" + date;
            Console.WriteLine(date.Length);
            return date;
        }

    }
}
