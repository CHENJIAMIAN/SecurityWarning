/**********************************************************
* 模块名称：实体常用简单数据操作辅助扩展基类
* 当前版本：1.0
* 开发人员：楚涛
* 生成时间：2019/2/25 星期一
* 版本历史：此代码由 VB/C#.Net实体代码生成工具(EntitysCodeGenerate 4.8) 自动生成。
*
***********************************************************/
using System;
using System.Collections;
using System.Collections.Specialized;
using System.Collections.Generic;
using System.Text;
using System.Xml;
using System.Data;
using System.Database;
using System.Database.ORMap;
using System.Database.Extend;

/// <summary>
/// 实体基类(以实体命名空间划分)
/// </summary>
public abstract class BaseEntity
{
    #region 实体类数据库连接配置 数据库连接类型及连接字符串中间获取类,可扩展修改从其他地方读取
    /// <summary>
    /// 数据库连接字符串
    /// </summary>
    private static string connectString = "SERVER=localhost;PORT=5432;DATABASE=OpengisDataBase;USER ID=postgres;PASSWORD=1234";//修改后记得重新生成
                                                                                                                               /// <summary>
                                                                                                                               /// 数据库连接字符串中间获取类,也可扩展修改从其他地方读取(最终获取是以此方法为准)
                                                                                                                               /// </summary>
                                                                                                                               /// <returns>数据库连接字符串</returns>
    public static string GetConnectionString()
    {
        return connectString;
    }
    /// <summary>
    /// 设置数据库连接字符串,设置后该基类下的子类实体的数据库连接都将会改变
    /// </summary>
    /// <param name="connectStr">数据库连接字符串</param>
    public void SetConnectionString(string connectStr)
    {
        connectString = connectStr;
    }

    /// <summary>
    /// 数据库连接类型
    /// </summary>
    private static DatabaseType database_Type = DatabaseType.PostgreSQL;//修改后记得重新生成
                                                                        /// <summary>
                                                                        /// 获取数据库连接类型,也可扩展修改从其他地方读取(最终获取是以此方法为准)
                                                                        /// </summary>
                                                                        /// <returns>数据库连接类型</returns>
    public static DatabaseType GetDatabaseType()
    {
        return database_Type;
    }
    /// <summary>
    /// 设置数据库连接类型,设置后该基类下的子类实体的数据库连接都将会改变
    /// </summary>
    /// <param name="databaseType">数据库连接类型DatabaseType</param>
    public static void SetDatabaseType(DatabaseType databaseType)
    {
        database_Type = databaseType;
    }
    #endregion

    #region public static DataSet ExecuteDataSet/object ExecuteScalar/int ExecuteNonQuery/ExecuteStoredProcedure 直接执行SQL的静态方法
    /// <summary>
    /// 获取SQL语句执行的数据集结果
    /// </summary>
    /// <param name="strSql">SQL语句</param>
    /// <returns>SQL语句执行的数据集结果</returns>
    public static DataSet ExecuteDataSet(string strSql)
    {
        try
        {
            return new DbCore(GetDatabaseType(), GetConnectionString()).ExecuteDataSet(strSql);
        }
        catch (Exception ex)
        {
            if (ex.Message == "ER_pkey: 23505: duplicate key value violates unique constraint \"T_USER_pkey\"")
            {
                return null;
            }
            throw ex;
        }
    }
    /// <summary>
    /// 获取SQL语句执行的第一行第一列的值
    /// </summary>
    /// <param name="strSql">SQL语句</param>
    /// <returns>SQL语句执行的第一行第一列的值</returns>
    public static object ExecuteScalar(string strSql)
    {
        DbCore dbCore = null;
        object obj = null;
        try
        {
            dbCore = new DbCore(GetDatabaseType(), GetConnectionString());
            dbCore.Open();
            obj = dbCore.ExecuteScalar(strSql);
            dbCore.Close();
            return obj;
        }
        catch (Exception ex)
        {
            if (dbCore != null) dbCore.Close();
            throw ex;
        }
    }
    /// <summary>
    /// 执行一个SQL语句命令并返回受影响的行数
    /// </summary>
    /// <param name="strSql">SQL语句</param>
    /// <returns>SQL语句执行后受影响的行数</returns>
    public static int ExecuteNonQuery(string strSql)
    {
        DbCore dbCore = null;
        try
        {
            dbCore = new DbCore(GetDatabaseType(), GetConnectionString());
            dbCore.Open();
            return dbCore.ExecuteNonQuery(strSql);
        }
        catch (Exception ex)
        {
            throw ex;
        }
        finally
        {
            if (dbCore != null) dbCore.Close();
        }
    }
    /// <summary>
    /// 快速执行一不带参数的存储过程
    /// </summary>
    /// <param name="strStoredProcedureName">存储过程名称</param>
    /// <returns>存储过程执行后受影响的行数</returns>
    public static int ExecuteStoredProcedure(string strStoredProcedureName)
    {
        DbCore dbCore = null;
        try
        {
            dbCore = new DbCore(GetDatabaseType(), GetConnectionString());
            dbCore.Open();
            return dbCore.ExecuteStoredProcedure(strStoredProcedureName);
        }
        catch (Exception ex)
        {
            throw ex;
        }
        finally
        {
            if (dbCore != null) dbCore.Close();
        }
    }
    #endregion

    #region 常用 增、删、改、查 操作(注：.Net下数值型字段初始值默认为0;带?的数值型字段值默认为null.)

    #region public int InsertEx/UpdateEx/SaveEx/DelInsert/DelInsertEx/DelInsertAll  扩展方法
    /// <summary>
    /// 通过实体映射插入表中一条数据(插入全部字段,其中若与实体属性字段初始值相同则置该字段为空)
    /// </summary>
    /// <returns>执行插入数据并返回受影响的行数</returns>
    public int InsertEx()
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.InsertEx();
    }
    /// <summary>
    /// 通过实体映射及主键条件更新表中一条数据(更新全部字段,其中若与实体属性字段初始值相同则置该字段为空)
    /// </summary>
    /// <returns>执行更新数据并返回受影响的行数</returns>
    public int UpdateEx()
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.UpdateEx();
    }
    /// <summary>
    /// 保存 按主键判断有就更新，没有就插入(保存全部字段,其中若与实体属性字段初始值相同则置该字段为空)
    /// </summary>
    /// <returns>执行更新并返回受影响的行数</returns>
    public int SaveEx()
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.SaveEx();
    }
    /// <summary>
    ///  先Delete后Insert 比较实体前后默认的初始值,且不插入与实体初始值相同的字段值
    /// </summary>
    /// <param name="strConditionKey">指定作为Delete依据的一个字段,可以使用对应的EntityColumn属性</param>
    /// <returns>先Delete后Insert并返回受影响的行数</returns>
    public int DelInsert(string strConditionKey)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.DelInsert(strConditionKey);
    }
    /// <summary>
    ///  先Delete后Insert 比较实体前后默认的初始值,且不插入与实体初始值相同的字段值
    /// </summary>
    /// <param name="arrConditionKey">指定作为Delete依据字段,一个或多个,可以使用对应的EntityColumn属性</param>
    /// <returns>先Delete后Insert并返回受影响的行数</returns>
    public int DelInsert(string[] arrConditionKey)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.DelInsert(arrConditionKey);
    }
    /// <summary>
    /// 先Delete后Insert 插入所有字段,其中若与实体字段初始值相同则置该字段为空
    /// </summary>
    /// <param name="strConditionKey">指定作为Delete依据的一个字段,可以使用对应的EntityColumn属性</param>
    /// <returns>先Delete后Insert并返回受影响的行数</returns>
    public int DelInsertEx(string strConditionKey)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.DelInsertEx(strConditionKey);
    }
    /// <summary>
    /// 先Delete后Insert 插入所有字段,其中若与实体字段初始值相同则置该字段为空
    /// </summary>
    /// <param name="arrConditionKey">指定作为Delete依据字段,一个或多个,可以使用对应的EntityColumn属性</param>
    /// <returns>先Delete后Insert并返回受影响的行数</returns>
    public int DelInsertEx(string[] arrConditionKey)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.DelInsertEx(arrConditionKey);
    }
    /// <summary>
    /// 先Delete后Insert 插入所有字段
    /// </summary>
    /// <returns>先Delete后Insert并返回受影响的行数</returns>
    public int DelInsertAll()
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.DelInsertAll();
    }
    /// <summary>
    /// 先Delete后Insert 插入所有字段
    /// </summary>
    /// <param name="strConditionKey">指定作为Delete依据的一个字段,可以使用对应的EntityColumn属性</param>
    /// <returns>先Delete后Insert并返回受影响的行数</returns>
    public int DelInsertAll(string strConditionKey)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.DelInsertAll(strConditionKey);
    }
    /// <summary>
    /// 先Delete后Insert 插入所有字段
    /// </summary>
    /// <param name="arrConditionKey">指定作为Delete依据字段,一个或多个,可以使用对应的EntityColumn属性</param>
    /// <returns>先Delete后Insert并返回受影响的行数</returns>
    public int DelInsertAll(string[] arrConditionKey)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.DelInsertAll(arrConditionKey);
    }
    #endregion

    #region public abstract int DelInsert/DelInsertEx/Insert/Update/Save 抽象方法
    /// <summary>
    ///  先Delete后Insert 比较实体前后默认的初始值,且不插入与实体初始值相同的字段值
    /// </summary>
    /// <returns>先Delete后Insert并返回受影响的行数</returns>
    public abstract int DelInsert();
    /// <summary>
    /// 先Delete后Insert 插入所有字段,其中若与实体字段初始值相同则置该字段为空
    /// </summary>
    /// <returns>先Delete后Insert并返回受影响的行数</returns>
    public abstract int DelInsertEx();
    /// <summary>
    /// 通过实体映射插入表中一条数据，插入与初始值不同的字段
    /// </summary>
    /// <returns>执行插入数据并返回受影响的行数</returns>
    public abstract int Insert();
    /// <summary>
    /// 通过实体映射及主键约束更新表中一条数据，并与比较实体初始值比较，若内容不同则更新之，否则不更新(并与实体默认初始值比较确定更新哪些字段,与默认初始值一样的字段将不更新)
    /// </summary>
    /// <returns>执行更新并返回受影响的行数</returns>
    public abstract int Update();
    /// <summary>
    /// 保存 比较实体前后的值，若有与主键记录相同的就更新，没有就插入，且不保存与实体初始值相同的字段值
    /// </summary>
    /// <returns>执行更新或插入数据操作并返回受影响的行数</returns>
    public abstract int Save();
    #endregion

    #region public int Insert 增加
    /// <summary>
    /// 通过实体映射插入表中一条数据，插入全部字段
    /// </summary>
    /// <returns>执行插入数据并返回受影响的行数</returns>
    public int InsertAll()
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.Insert();
    }
    /// <summary>
    /// 通过HashTable表的键值数据信息映射插入表中一条数据，插入数据为HashTable中的数据
    /// </summary>
    /// <param name="hash">Hashtable</param>
    /// <returns>执行插入数据并返回受影响的行数</returns>
    public int Insert(Hashtable hash)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.Insert(hash);
    }
    /// <summary>
    /// 通过ListDictionary表的键值数据信息映射插入表中一条数据，插入数据为ListDictionary中的数据，通常包含 10 个或 10 个以下项的集合,建议这时使用
    /// </summary>
    /// <param name="list">ListDictionary</param>
    /// <returns>执行插入数据并返回受影响的行数</returns>
    public int Insert(ListDictionary list)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.Insert(list);
    }
    #endregion

    #region public int Update 更新
    /// <summary>
    /// 通过实体映射及主键条件更新表中一条数据，更新全部字段
    /// </summary>
    /// <returns>执行更新数据并返回受影响的行数</returns>
    public int UpdateAll()
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.Update();
    }
    /// <summary>
    /// 根据HashTable更新条件更新实体映射表对应的记录
    /// </summary>
    /// <param name="hashCondition">更新条件</param>
    /// <param name="hashColAndValue">更新字段</param>
    /// <returns>执行更新并返回受影响的行数</returns>
    public int Update(Hashtable hashCondition, Hashtable hashColAndValue)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.Update(hashCondition, hashColAndValue);
    }
    /// <summary>
    /// 根据ListDictionary更新条件更新实体映射表对应的记录
    /// </summary>
    /// <param name="listCondition">更新条件</param>
    /// <param name="listColAndValue">更新字段</param>
    /// <returns>执行更新并返回受影响的行数</returns>
    public int Update(ListDictionary listCondition, ListDictionary listColAndValue)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.Update(listCondition, listColAndValue);
    }
    #endregion

    #region public int Delete 删除
    /// <summary>
    /// 通过实体映射及主键约束删除主键字段对应的信息值
    /// </summary>
    /// <returns>执行删除数据并返回受影响的行数</returns>
    public int Delete()
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.Delete();
    }
    /// <summary>
    /// 根据条件信息值删除指定符合条件的信息值
    /// </summary>
    /// <param name="hash">删除条件Hashtable</param>
    /// <returns>执行删除数据并返回受影响的行数</returns>
    public int Delete(Hashtable hash)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.Delete(hash);
    }
    /// <summary>
    /// 根据条件信息值删除指定符合条件的信息值,通常包含 10 个或 10 个以下项的集合,建议这时使用
    /// </summary>
    /// <param name="list">删除条件ListDictionary</param>
    /// <returns>执行删除数据并返回受影响的行数</returns>
    public int Delete(ListDictionary list)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.Delete(list);
    }
    #endregion

    #region public int Save 保存 规则：按主键判断有就更新，没有就插入
    /// <summary>
    /// 根据HashTable保存条件保存实体映射表对应的记录
    /// </summary>
    /// <param name="hashCondition">保存条件</param>
    /// <param name="hashColAndValue">保存字段</param>
    /// <returns>执行更新并返回受影响的行数</returns>
    public int Save(Hashtable hashCondition, Hashtable hashColAndValue)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.Save(hashCondition, hashColAndValue);
    }
    /// <summary>
    /// 根据ListDictionary保存条件保存实体映射表对应的记录
    /// </summary>
    /// <param name="listCondition">保存条件</param>
    /// <param name="listColAndValue">保存字段</param>
    /// <returns>执行更新并返回受影响的行数</returns>
    public int Save(ListDictionary listCondition, ListDictionary listColAndValue)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.Save(listCondition, listColAndValue);
    }
    #endregion

    #region public int SaveAll 保存 规则：按主键判断有就更新，没有就插入，保存全部字段
    /// <summary>
    /// 保存 比较实体前后的值，若有与主键记录相同的就更新，没有就插入，保存全部字段
    /// </summary>
    /// <returns>执行更新或插入数据操作并返回受影响的行数</returns>
    public int SaveAll()
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.SaveAll();
    }
    #endregion

    #region public int Insert(DbCore dbCore)/Update(DbCore dbCore)/Save(DbCore dbCore)
    /// <summary>
    /// 通过实体映射插入表中一条数据，比较实体前后默认的初始值，插入与初始值不同的字段
    /// </summary>
    /// <param name="dbCore">数据库访问核心类DbCore实例(用于DbCore事务,执行命令先打开(Open)数据库连接)</param>
    /// <returns>执行插入并返回受影响的行数</returns>
    public int Insert(DbCore dbCore)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.Insert(dbCore);
    }
    /// <summary>
    /// 通过实体映射插入表中一条数据，插入全部字段
    /// </summary>
    /// <param name="dbCore">数据库访问核心类DbCore实例(用于DbCore事务,执行命令先打开(Open)数据库连接)</param>
    /// <returns>执行插入并返回受影响的行数</returns>
    public int InsertAll(DbCore dbCore)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.InsertAll(dbCore);
    }
    /// <summary>
    /// 通过实体映射插入表中一条数据(插入所有字段其中若与实体字段初始值相同则置该字段为空)
    /// </summary>
    /// <param name="dbCore">数据库访问核心类DbCore实例(用于DbCore事务,执行命令先打开(Open)数据库连接)</param>
    /// <returns>执行插入并返回受影响的行数</returns>
    public int InsertEx(DbCore dbCore)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.InsertEx(dbCore);
    }
    /// <summary>
    /// 通过实体映射及主键约束更新表中一条数据，并与比较实体初始值比较，若属性字段值不同则更新之，否则不更新
    /// </summary>
    /// <param name="dbCore">数据库访问核心类DbCore实例(用于DbCore事务,执行命令先打开(Open)数据库连接)</param>
    /// <returns>执行更新并返回受影响的行数</returns>
    public int Update(DbCore dbCore)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.Update(dbCore);
    }
    /// <summary>
    /// 通过实体映射及主键条件更新表中一条数据，更新全部字段
    /// </summary>
    /// <param name="dbCore">数据库访问核心类DbCore实例(用于DbCore事务,执行命令先打开(Open)数据库连接)</param>
    /// <returns>执行更新并返回受影响的行数</returns>
    public int UpdateAll(DbCore dbCore)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.UpdateAll(dbCore);
    }
    /// <summary>
    /// 通过实体映射及主键条件更新表中一条数据(更新所有字段,其中若与实体字段初始值相同则置该字段为空)
    /// </summary>
    /// <param name="dbCore">数据库访问核心类DbCore实例(用于DbCore事务,执行命令先打开(Open)数据库连接)</param>
    /// <returns>执行更新并返回受影响的行数</returns>
    public int UpdateEx(DbCore dbCore)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.UpdateEx(dbCore);
    }
    /// <summary>
    /// 保存 比较实体前后的值(并与实体默认初始值比较确定保存哪些字段)，若有与主键记录相同的就更新，没有就插入
    /// </summary>
    /// <param name="dbCore">数据库访问核心类DbCore实例(用于DbCore事务,执行命令先打开(Open)数据库连接)</param>
    /// <returns>执行更新或插入数据操作并返回受影响的行数</returns>
    public int Save(DbCore dbCore)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.Save(dbCore);
    }
    /// <summary>
    /// 保存全部字段 比较实体前后的值，若有与主键记录相同的就更新，没有就插入
    /// </summary>
    /// <param name="dbCore">数据库访问核心类DbCore实例(用于DbCore事务,执行命令先打开(Open)数据库连接)</param>
    /// <returns>执行更新或插入数据操作并返回受影响的行数</returns>
    public int SaveAll(DbCore dbCore)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.SaveAll(dbCore);
    }
    /// <summary>
    /// 保存 比较实体(EntitysCodeGenerate生成带数据访问的实体)前后的值，若有与主键记录相同的就更新，没有就插入
    /// 保存所有字段,其中若与实体字段初始值相同则置该字段为空
    /// </summary>
    /// <param name="dbCore">数据库访问核心类DbCore实例(用于DbCore事务,执行命令先打开(Open)数据库连接)</param>
    /// <returns>执行更新或插入数据操作并返回受影响的行数</returns>
    public int SaveEx(DbCore dbCore)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.SaveEx(dbCore);
    }
    #endregion

    #region public int GetInt?MaxID 获取实体对应表字段的最大值ID+1
    /// <summary>
    /// 获取实体对应表字段默认第一个主键的最大值ID+1
    /// </summary>
    /// <returns>获取实体对应表字段默认第一个主键的最大值ID+1，没有主键或类型不为数值型返回-1</returns>
    public int GetInt32MaxID()
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.GetInt32MaxID();
    }
    /// <summary>
    /// 获取实体对应表字段默认第一个主键的最大值ID+1
    /// </summary>
    /// <returns>获取实体对应表字段默认第一个主键的最大值ID+1，没有主键或类型不为数值型返回-1</returns>
    public long GetInt64MaxID()
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.GetInt64MaxID();
    }
    /// <summary>
    /// 获取实体对应表指定字段的最大值ID+1
    /// </summary>
    /// <param name="strField">指定字段名</param>
    /// <returns>获取实体对应表指定字段最大值ID+1，没有对应字段或类型不为数值型返回-1</returns>
    public int GetInt32MaxID(string strField)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.GetInt32MaxID(strField);
    }
    /// <summary>
    /// 获取实体对应表指定字段的最大值ID+1
    /// </summary>
    /// <param name="strField">指定字段名</param>
    /// <returns>获取实体对应表指定字段最大值ID+1，没有对应字段或类型不为数值型返回-1</returns>
    public long GetInt64MaxID(string strField)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.GetInt64MaxID(strField);
    }
    #endregion

    #region public DataTable GetDataTable 获取实体对应表的信息集，并以数据表的信息形式返回
    /// <summary>
    ///  获取实体对应表的所有信息集合，并以数据表的信息形式返回
    /// </summary>
    /// <returns>返回数据表的所有信息</returns>
    public DataTable GetDataTable()
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.GetDataTable(new ListDictionary());
    }
    /// <summary>
    /// 获取实体对应表的信息集，并以数据表的信息形式返回
    /// </summary>
    /// <param name="hashCondition">获取数据表信息的条件值(=)</param>
    /// <returns>返回符合并条件数据表的信息</returns>
    public DataTable GetDataTable(Hashtable hashCondition)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.GetDataTable(hashCondition);
    }
    /// <summary>
    /// 获取实体对应表的信息集，并以数据表的信息形式返回
    /// </summary>
    /// <param name="listColAndValue">获取数据表信息的条件值(=)</param>
    /// <returns>返回符合并条件数据表的信息</returns>
    public DataTable GetDataTable(ListDictionary listColAndValue)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.GetDataTable(listColAndValue);
    }
    /// <summary>
    /// 获取实体对应表指定排序的信息集，并以数据表的信息形式返回
    /// </summary>
    /// <param name="colName">排序字段(默认升序排序)</param>
    /// <returns>返回符合排序条件数据表的信息</returns>
    public DataTable GetDataTable(string colName)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.GetDataTable(colName, OrderDirection.Asc);
    }
    /// <summary>
    /// 获取实体对应表指定排序的信息集，并以数据表的信息形式返回
    /// </summary>
    /// <param name="colName">排序字段</param>
    /// <param name="order">排序方向</param>
    /// <returns>返回符合排序条件数据表的信息</returns>
    public DataTable GetDataTable(string colName, OrderDirection order)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.GetDataTable(colName, order);
    }
    /// <summary>
    /// 获取实体对应表指定排序的信息集，并以数据表的信息形式返回
    /// </summary>
    /// <param name="colName1">排序字段1</param>
    /// <param name="order1">排序方向1</param>
    /// <param name="colName2">排序字段2</param>
    /// <param name="order2">排序方向2</param>
    /// <returns>返回符合排序条件数据表的信息</returns>
    public DataTable GetDataTable(string colName1, OrderDirection order1, string colName2, OrderDirection order2)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.GetDataTable(colName1, order1, colName2, order2);
    }
    /// <summary>
    /// 获取实体对应表指定排序的信息集，并以数据表的信息形式返回
    /// </summary>
    /// <param name="colNames">排序字段数组</param>
    /// <param name="order">排序方向</param>
    /// <returns>返回符合排序条件数据表的信息</returns>
    public DataTable GetDataTable(string[] colNames, OrderDirection order)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.GetDataTable(colNames, order);
    }
    /// <summary>
    /// 获取实体对应表指定排序的信息集，并以数据表的信息形式返回
    /// </summary>
    /// <param name="orderColumns">排序字段数组</param>
    /// <param name="orderDirections">排序方向数组</param>
    /// <returns>返回符合排序条件数据表的信息</returns>
    public DataTable GetDataTable(string[] orderColumns, OrderDirection[] orderDirections)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.GetDataTable(new string[] { }, new Operation[] { }, new object[] { }, orderColumns, orderDirections);
    }
    /// <summary>
    /// 获取实体对应表指定排序的信息集，并以数据表的信息形式返回
    /// </summary>
    /// <param name="listColAndValue">获取数据表信息的条件值</param>
    /// <param name="operates">条件字段名对应比较操作符</param>
    /// <param name="orderColNames">排序字段数组</param>
    /// <param name="orderDirections">排序字段对应排序方向</param>
    /// <returns>返回符合排序条件数据表的信息</returns>
    public DataTable GetDataTable(ListDictionary listColAndValue, Operation[] operates, string[] orderColNames, OrderDirection[] orderDirections)
    {
        if (listColAndValue.Count == operates.Length)
        {
            ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
            return ormap.GetDataTable(listColAndValue, operates, orderColNames, orderDirections);
        }
        else
        {
            return null;
        }
    }
    /// <summary>
    /// 获取实体对应表的信息集，并以数据表的信息形式返回
    /// </summary>
    /// <param name="colName">实体字段名</param>
    /// <param name="colValue">实体字段名对应的相等值</param>
    /// <returns>返回符合条件的数据表信息</returns>
    public DataTable GetDataTable(string colName, object colValue)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.GetDataTable(colName, colValue);
    }
    /// <summary>
    /// 获取实体对应表的信息集，并以数据表的信息形式返回
    /// </summary>
    /// <param name="colNames">实体字段名数组</param>
    /// <param name="colValues">实体字段名数组对应的相等值</param>
    /// <returns>返回符合条件的数据表信息</returns>
    public DataTable GetDataTable(string[] colNames, object[] colValues)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.GetDataTable(colNames, colValues);
    }
    /// <summary>
    /// 获取实体对应表的信息集，并以数据表的信息形式返回
    /// </summary>
    /// <param name="colName">实体字段名</param>
    /// <param name="operate">比较操作符</param>
    /// <param name="colValue">实体字段名对应的值</param>
    /// <returns>返回符合条件的数据表信息</returns>
    public DataTable GetDataTable(string colName, Operation operate, object colValue)
    {
        return this.GetDataTable(colName, operate, colValue, new string[] { }, new OrderDirection[] { });
    }
    /// <summary>
    /// 获取实体对应表的信息集，并以数据表的信息形式返回
    /// </summary>
    /// <param name="colName">实体字段名</param>
    /// <param name="operate">比较操作符</param>
    /// <param name="colValue">实体字段名对应的值</param>
    /// <param name="orderColumn">排序字段</param>
    /// <param name="orderDirection">对应排序方向</param>
    /// <returns>返回符合条件的数据表信息</returns>
    public DataTable GetDataTable(string colName, Operation operate, object colValue,
        string orderColumn, OrderDirection orderDirection)
    {
        return this.GetDataTable(colName, operate, colValue, new string[] { orderColumn }, new OrderDirection[] { orderDirection });
    }
    /// <summary>
    /// 获取实体对应表的信息集，并以数据表的信息形式返回
    /// </summary>
    /// <param name="colName">实体字段名</param>
    /// <param name="operate">比较操作符</param>
    /// <param name="colValue">实体字段名对应的值</param>
    /// <param name="orderColumns">排序字段数组</param>
    /// <param name="orderDirections">对应排序方向数组</param>
    /// <returns>返回符合条件的数据表信息</returns>
    public DataTable GetDataTable(string colName, Operation operate, object colValue,
        string[] orderColumns, OrderDirection[] orderDirections)
    {
        return this.GetDataTable(new string[] { colName }, new Operation[] { operate }, new object[] { colValue }, orderColumns, orderDirections);
    }
    /// <summary>
    /// 获取实体对应表的信息集，并以数据表的信息形式返回
    /// </summary>
    /// <param name="colNames">实体字段名数组</param>
    /// <param name="operates">比较操作符数组</param>
    /// <param name="colValues">实体字段名对应的值数组</param>
    /// <param name="orderColumns">排序字段数组</param>
    /// <returns>返回符合条件的数据表信息</returns>
    public DataTable GetDataTable(string[] colNames, Operation[] operates, object[] colValues, string[] orderColumns)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.GetDataTable(colNames, operates, colValues, orderColumns);
    }
    /// <summary>
    /// 获取实体对应表的信息集，并以数据表的信息形式返回
    /// </summary>
    /// <param name="colNames">实体字段名数组</param>
    /// <param name="operates">比较操作符数组</param>
    /// <param name="colValues">实体字段名对应的值数组</param>
    /// <param name="orderColumns">排序字段数组</param>
    /// <param name="orderDirections">对应排序方向数组</param>
    /// <returns>返回符合条件的数据表信息</returns>
    public DataTable GetDataTable(string[] colNames, Operation[] operates, object[] colValues,
        string[] orderColumns, OrderDirection[] orderDirections)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.GetDataTable(colNames, operates, colValues, orderColumns, orderDirections);
    }
    /// <summary>
    /// 获取实体对应表的信息集，并以数据表的信息形式返回
    /// </summary>
    /// <param name="dbCore">数据库访问核心类DbCore实例(用于DbCore事务)</param>
    /// <param name="colName">实体字段名</param>
    /// <param name="operate">比较操作符</param>
    /// <param name="colValue">实体字段名对应的值</param>
    /// <param name="orderColumn">排序字段</param>
    /// <param name="orderDirection">对应排序方向</param>
    /// <returns>返回符合条件的数据表信息</returns>
    public DataTable GetDataTable(DbCore dbCore, string colName, Operation operate, object colValue,
        string orderColumn, OrderDirection orderDirection)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.GetDataTable(dbCore, colName, operate, colValue, orderColumn, orderDirection);
    }
    /// <summary>
    /// 获取实体对应表的信息集，并以数据表的信息形式返回
    /// </summary>
    /// <param name="dbCore">数据库访问核心类DbCore实例(用于DbCore事务)</param>
    /// <param name="colNames">实体字段名数组</param>
    /// <param name="operates">比较操作符数组</param>
    /// <param name="colValues">实体字段名对应的值数组</param>
    /// <param name="orderColumns">排序字段数组</param>
    /// <param name="orderDirections">对应排序方向数组</param>
    /// <returns>返回符合条件的数据表信息</returns>
    public DataTable GetDataTable(DbCore dbCore, string[] colNames, Operation[] operates, object[] colValues,
        string[] orderColumns, OrderDirection[] orderDirections)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.GetDataTable(dbCore, colNames, operates, colValues, orderColumns, orderDirections);
    }
    #endregion

    #region public object GetMaxValue/GetMinValue/GetAvgValue/GetCount
    /// <summary>
    /// 获取实体对应表指定字段的最大值
    /// </summary>
    /// <param name="strField">指定字段</param>
    /// <returns>指定字段的最大值</returns>
    public object GetMaxValue(string strField)
    {
        return new ORMap<BaseEntity>(this).GetMaxValue(strField);
    }
    /// <summary>
    /// 获取实体对应表指定字段的最小值
    /// </summary>
    /// <param name="strField">指定字段</param>
    /// <returns>指定字段的最小值</returns>
    public object GetMinValue(string strField)
    {
        return new ORMap<BaseEntity>(this).GetMinValue(strField);
    }
    /// <summary>
    /// 获取实体对应表指定字段的平均值
    /// </summary>
    /// <param name="strField">指定字段</param>
    /// <returns>指定字段的平均值</returns>
    public object GetAvgValue(string strField)
    {
        return new ORMap<BaseEntity>(this).GetAvgValue(strField);
    }
    /// <summary>
    /// 获取实体对应表指定字段统计行值
    /// </summary>
    /// <param name="strField">指定字段名，默认(*)</param>
    /// <returns>指定字段统计行值</returns>
    public object GetCount(string strField)
    {
        return new ORMap<BaseEntity>(this).GetCount(strField);
    }
    #endregion

    #region public object GetSqlValue/DataSet GetSqlDataSet/int DoSqlNonQuery
    /// <summary>
    /// 获取SQL语句执行的第一行第一列的值
    /// </summary>
    /// <param name="strSql">SQL语句</param>
    /// <returns>SQL语句执行的第一行第一列的值</returns>
    public object GetSqlValue(string strSql)
    {
        return new ORMap<BaseEntity>(this).GetSqlValue(strSql);
    }
    /// <summary>
    /// 获取SQL语句执行的数据集结果
    /// </summary>
    /// <param name="strSql">SQL语句</param>
    /// <returns>SQL语句执行的数据集结果</returns>
    public DataSet GetSqlDataSet(string strSql)
    {
        return new ORMap<BaseEntity>(this).GetSqlDataSet(strSql);
    }
    /// <summary>
    /// 根据SQL语句执行一个命令并返回受影响的行数(原GetSqlNonQuery)
    /// </summary>
    /// <param name="strSql">SQL语句</param>
    /// <returns>SQL语句执行后受影响的行数</returns>
    public int DoSqlNonQuery(string strSql)
    {
        return new ORMap<BaseEntity>(this).GetSqlNonQuery(strSql);
    }
    /// <summary>
    /// 获取SQL语句执行的第一行第一列的值
    /// </summary>
    /// <param name="dbCore">数据库访问核心类DbCore实例(用于DbCore事务)</param>
    /// <param name="strSql">SQL语句</param>
    /// <returns>SQL语句执行的第一行第一列的值</returns>
    public object GetSqlValue(DbCore dbCore, string strSql)
    {
        return new ORMap<BaseEntity>(this).GetSqlValue(dbCore, strSql);
    }
    /// <summary>
    /// 获取SQL语句执行的数据集结果
    /// </summary>
    /// <param name="dbCore">数据库访问核心类DbCore实例(用于DbCore事务)</param>
    /// <param name="strSql">SQL语句</param>
    /// <returns>SQL语句执行的数据集结果</returns>
    public DataSet GetSqlDataSet(DbCore dbCore, string strSql)
    {
        return new ORMap<BaseEntity>(this).GetSqlDataSet(dbCore, strSql);
    }
    /// <summary>
    /// 根据SQL语句执行一个命令并返回受影响的行数(原GetSqlNonQuery)
    /// </summary>
    /// <param name="dbCore">数据库访问核心类DbCore实例(用于DbCore事务)</param>
    /// <param name="strSql">SQL语句</param>
    /// <returns>SQL语句执行后受影响的行数</returns>
    public int DoSqlNonQuery(DbCore dbCore, string strSql)
    {
        return new ORMap<BaseEntity>(this).GetSqlNonQuery(dbCore, strSql);
    }
    #endregion

    #endregion

    #region public string ToXml 相关Xml操作
    /// <summary>
    /// 将持久化实体信息输出成Xml格式文本信息(不含DataType属性)
    /// </summary>
    /// <returns>与持久化实体信息相对应Xml的文本信息</returns>
    public string ToXml()
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.ToXml(Formatting.None);
    }
    /// <summary>
    /// 将持久化实体信息输出成Xml格式文本信息(不含DataType属性)
    /// </summary>
    /// <param name="xmlFormatting">指定 System.Xml.XmlTextWriter 的格式设置选项</param>
    /// <returns>与持久化实体信息相对应Xml指定格式化后的文本信息(不含DataType属性)</returns>
    public string ToXml(Formatting xmlFormatting)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.ToXml(xmlFormatting);
    }
    /// <summary>
    /// 将持久化实体信息输出成Xml格式信息并写入到文件(不含DataType属性)
    /// </summary>
    /// <param name="filename">要写入的文件名。如果该文件存在，它将截断该文件并用新内容对其进行覆盖。</param>
    /// <param name="encoding">要生成的编码方式。如果编码方式为 null，它将以 UTF-8 的形式写出该文件，并忽略 ProcessingInstruction 中的编码属性。</param>
    /// <param name="xmlFormatting">指定 System.Xml.XmlTextWriter 的格式设置选项</param>
    public void ToXml(string filename, Encoding encoding, Formatting xmlFormatting)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        ormap.ToXml(filename, encoding, xmlFormatting);
    }
    /// <summary>
    /// 将持久化实体信息输出成Xml格式文本信息(含DataType属性)
    /// </summary>
    /// <param name="xmlFormatting">指定 System.Xml.XmlTextWriter 的格式设置选项</param>
    /// <returns>与持久化实体信息相对应Xml指定格式化后的文本信息</returns>
    public string ToXml_(Formatting xmlFormatting)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.ToXml_(xmlFormatting);
    }
    /// <summary>
    /// 将持久化实体信息输出成Xml格式信息并写入到文件(含DataType属性)
    /// </summary>
    /// <param name="filename">要写入的文件名。如果该文件存在，它将截断该文件并用新内容对其进行覆盖。</param>
    /// <param name="encoding">要生成的编码方式。如果编码方式为 null，它将以 UTF-8 的形式写出该文件，并忽略 ProcessingInstruction 中的编码属性。</param>
    /// <param name="xmlFormatting">指定 System.Xml.XmlTextWriter 的格式设置选项</param>
    public void ToXml_(string filename, Encoding encoding, Formatting xmlFormatting)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        ormap.ToXml_(filename, encoding, xmlFormatting);
    }
    #endregion

    #region public static T FromXml<T> 相关Xml操作
    /// <summary>
    /// 通过与持久化实体信息相对应Xml格式的文本信息实例化到该实体信息
    /// </summary>
    /// <param name="xmlString">与持久化实体信息相对应Xml格式的文本信息</param>
    /// <returns>返回对应的实体信息</returns>
    public static T FromXml<T>(string xmlString) where T : BaseEntity, new()
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(new T(), new T());
        return ormap.FromXml(xmlString) as T;
    }
    /// <summary>
    /// 通过与持久化实体信息相对应Xml格式的文本信息实例化到该实体信息
    /// </summary>
    /// <param name="filename">文件的 URL，该文件包含要加载的 XML 文档。URL 既可以是本地文件，也可以是 HTTP URL（Web 地址）。</param>
    /// <returns>实例化该实体信息并与持久化实体信息相对应xmlString文本信息一致</returns>
    public static T FromXmlFile<T>(string filename) where T : BaseEntity, new()
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(new T(), new T());
        return ormap.FromXmlFile(filename) as T;
    }
    #endregion

    #region public override string ToString 将持久化实体信息输出成字符串拼接文本信息
    /// <summary>
    /// 将持久化实体信息输出成字符串拼接文本信息
    /// </summary>
    /// <returns>与持久化实体信息相对应的字符串拼接文本信息</returns>
    public override string ToString()
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.ToEntityString();
    }
    #endregion

    #region public string ToJSON 将持久化实体信息输出成JSON格式信息
    /// <summary>
    /// 将持久化实体信息输出成JSON格式文本信息
    /// </summary>
    /// <returns>与持久化实体信息相同的JSON格式文本信息</returns>
    public string ToJSON()
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.ToJSON();
    }
    /// <summary>
    /// 将持久化实体信息输出成Json格式文本信息
    /// </summary>
    /// <param name="formatting">Json格式设置选项</param>
    /// <returns>与持久化实体信息相同的Json格式文本信息</returns>
    public string ToJson(System.Database.Provider.JsonFormatting formatting)
    {
        ORMap<BaseEntity> ormap = new ORMap<BaseEntity>(this);
        return ormap.ToJson(formatting);
    }
    #endregion

    #region 类型映射，考虑兼容扩展的需要公开类型映射代码，对实体自定义类型数据库操作添加于此
    /// <summary>
    ///  获取 System.Type 的完全限定名，包括 System.Type 的命名空间，但不包括程序集
    /// </summary>
    /// <param name="strTypeFullName">System.Type 的完全限定名(区分大小写)，包括 System.Type 的命名空间，但不包括程序集</param>
    /// <returns>System.Data.DbType</returns>
    public static System.Data.DbType GetDBTypeByFullName(string strTypeFullName)
    {
        switch (strTypeFullName)
        {
            case "System.Byte":
                return System.Data.DbType.Byte;
            case "System.Byte[]":
                return System.Data.DbType.Binary;
            case "System.Boolean":
                return System.Data.DbType.Boolean;
            case "System.Char":
                return System.Data.DbType.Byte;
            case "System.DateTime":
                return System.Data.DbType.DateTime;
            case "System.Decimal":
                return System.Data.DbType.Decimal;
            case "System.Double":
                return System.Data.DbType.Double;
            case "System.Guid":
                return System.Data.DbType.Guid;
            case "System.Int16":
                return System.Data.DbType.Int16;
            case "System.Int32":
                return System.Data.DbType.Int32;
            case "System.Int64":
                return System.Data.DbType.Int64;
            case "System.UInt16":
                return System.Data.DbType.UInt16;
            case "System.UInt32":
                return System.Data.DbType.UInt32;
            case "System.UInt64":
                return System.Data.DbType.UInt64;
            case "System.SByte":
                return System.Data.DbType.SByte;
            case "System.String":
                return System.Data.DbType.AnsiString;
            case "System.Object":
                return System.Data.DbType.Object;
            case "System.Single":
                return System.Data.DbType.Single;
            case "System.TimeSpan":
                return System.Data.DbType.Time;

            //System.Data.DbType.AnsiStringFixedLength;
            //System.Data.DbType.Date;
            //System.Data.DbType.String;
            //System.Data.DbType.StringFixedLength;
            //System.Data.DbType.VarNumeric;
            //System.Data.DbType.Xml;
            //System.Data.DbType.Currency;
            //...其他类型添加至此
            default:
                return System.Data.DbType.Object;
        }
    }
    #endregion
}

