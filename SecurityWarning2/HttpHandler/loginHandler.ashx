<%@ WebHandler Language="C#" Class="loginHandler" %>

using System;
using System.Web;
using System.Web.SessionState;
using System.Text;
using System.Data;
using System.Collections.Generic;

public class loginHandler : IHttpHandler, IRequiresSessionState
{

    public loginHandler()
    {
    }
    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";

        StringBuilder _strContent = new StringBuilder();
        if (_strContent.Length == 0)
        {
            string _strAction = context.Request.Params["action"];
            if (string.IsNullOrEmpty(_strAction))
            {
                _strContent.Append("{\"msg\": \"0\", \"msgbox\": \"禁止访问！\",\"rows\": []}");
            }
            else
            {
                switch (_strAction.Trim().ToLower())
                {
                    case "userlogin": _strContent.Append(UserLogin(context)); break;
                    case "userregist": _strContent.Append(UserRegist(context)); break;
                    case "queryuser": _strContent.Append(QueryUser(context)); break;
                    default: break;
                }
            }
        }
        context.Response.Write(_strContent.ToString());
    }

    private string QueryUser(HttpContext context)
    {
        string SQL = string.Format("SELECT * FROM \"T_USER\"");
        DataTable dt = BaseEntity.ExecuteDataSet(SQL).Tables[0];
        System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
        List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
        Dictionary<string, object> row;

        foreach (DataRow dr in dt.Rows)
        {
            row = new Dictionary<string, object>();
            foreach (DataColumn col in dt.Columns)
            {
                row.Add(col.ColumnName, dr[col]);
            }
            rows.Add(row);
        }
        var json = serializer.Serialize(rows);
        return json;
    }
    private string UserLogin(HttpContext context)
    {
        string result = "";
        string _username = context.Request.Form["username"];
        string _password = context.Request.Form["password"];

        Model.cmUser model = new Model.cmUser();

        //当前浏览器已经有用户登录 判断是不是当前输入的用户
        //if (context.Session["UserModel"] != null && model.Name != _username)
        //model = (Model.cmUser)context.Session["UserModel"];
        //result = "{\"msg\": \"0\", \"msgbox\": \"此浏览器已经有其他用户登录！\"}";

        string SQL = string.Format("SELECT username FROM \"T_USER\" WHERE " +
        "username='{0}' AND password='{1}'", _username, _password);
        DataTable dt = BaseEntity.ExecuteDataSet(SQL).Tables[0];
        //用户和密码正确
        if (dt.Rows.Count > 0)
        {
            model.Name = dt.Rows[0]["username"].ToString();
            context.Session["UserModel"] = model;

            result = "{\"msg\": \"1\", \"msgbox\": \"登录成功！\"}";
        }
        else
        {
            result = "{\"msg\": \"0\", \"msgbox\": \"用户名或密码错误！\"}"; ;
        }

        return result;
    }

    private string UserRegist(HttpContext context)
    {
        string result = "";
        string _username = context.Request.Form["username"];
        string _password = context.Request.Form["password"];


        string SQL = string.Format("INSERT INTO \"T_USER\" VALUES('{0}','{1}')", _username, _password);
        DataSet ds = BaseEntity.ExecuteDataSet(SQL);
        if (null == ds)
        {
            result = "{\"msg\": \"0\", \"msgbox\": \"用户名已经存在！\"}"; ;
        }

        else
        {
            result = "{\"msg\": \"1\", \"msgbox\": \"注册成功！\"}";
        }

        return result;
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }
}