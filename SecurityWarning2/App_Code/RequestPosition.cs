using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Web;

/// <summary>
/// RequestPosition 的摘要说明
/// </summary>
public class RequestPosition
{
    public RequestPosition()
    {
        string url = "https://api2.bmob.cn/1/classes/position/b5bbd688b1";
        HttpWebRequest req = (HttpWebRequest)WebRequest.Create(url);
        req.Method = "GET";
        req.Headers["X-Bmob-Application-Id"] = "ae69ae4ad1b9328f1993c62a637454a7";
        req.Headers["X-Bmob-REST-API-Key"] = "05d377b293e63f9f9e22788154af1449";

        HttpWebResponse resp = (HttpWebResponse)req.GetResponse();
        Stream stream = resp.GetResponseStream();
        string result = "";
        //注意，此处使用的编码是：gb2312
        //using (StreamReader reader = new StreamReader(stream, Encoding.Default))
        using (StreamReader reader = new StreamReader(stream, Encoding.GetEncoding("UTF-8")))
        {
            result = reader.ReadToEnd();
        }
    }
}