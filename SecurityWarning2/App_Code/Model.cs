using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

/// <summary>
/// Model 的摘要说明
/// </summary>
public class Model
{

    public Model()
    {
        //
        // TODO: 在此处添加构造函数逻辑
        //
    }


    public class cmUser
    {
        private string name;
        public string Name
        {
            get
            {
                return name;
            }

            set
            {
                name = value;
            }
        }

    }
}