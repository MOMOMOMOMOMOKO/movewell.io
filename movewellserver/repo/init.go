package repo

import (
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Init() {
	DB = GormMysql()
}

type GeneralDB struct {
	Path         string `mapstructure:"path" json:"path" yaml:"path"`                               // 服务器地址:端口
	Port         string `mapstructure:"port" json:"port" yaml:"port"`                               //:端口
	Config       string `mapstructure:"config" json:"config" yaml:"config"`                         // 高级配置
	Dbname       string `mapstructure:"db-name" json:"db-name" yaml:"db-name"`                      // 数据库名
	Username     string `mapstructure:"username" json:"username" yaml:"username"`                   // 数据库用户名
	Password     string `mapstructure:"password" json:"password" yaml:"password"`                   // 数据库密码
	Prefix       string `mapstructure:"prefix" json:"prefix" yaml:"prefix"`                         //全局表前缀，单独定义TableName则不生效
	Singular     bool   `mapstructure:"singular" json:"singular" yaml:"singular"`                   //是否开启全局禁用复数，true表示开启
	Engine       string `mapstructure:"engine" json:"engine" yaml:"engine" default:"InnoDB"`        //数据库引擎，默认InnoDB
	MaxIdleConns int    `mapstructure:"max-idle-conns" json:"max-idle-conns" yaml:"max-idle-conns"` // 空闲中的最大连接数
	MaxOpenConns int    `mapstructure:"max-open-conns" json:"max-open-conns" yaml:"max-open-conns"` // 打开到数据库的最大连接数
	LogMode      string `mapstructure:"log-mode" json:"log-mode" yaml:"log-mode"`                   // 是否开启Gorm全局日志
	LogZap       bool   `mapstructure:"log-zap" json:"log-zap" yaml:"log-zap"`                      // 是否通过zap写入日志文件
}

func (m *GeneralDB) Dsn() string {
	return m.Username + ":" + m.Password + "@tcp(" + m.Path + ":" + m.Port + ")/" + m.Dbname + "?" + m.Config
}

func GormMysql() *gorm.DB {
	m := &GeneralDB{
		Path:     "39.99.135.224",
		Port:     "3306",
		Username: "root",
		Password: "mysql123",
		Dbname:   "move_well",
		Config:   "charset=utf8mb4&parseTime=True&loc=Local",
	}
	mysqlConfig := mysql.Config{
		DSN:                       m.Dsn(), // DSN data source name
		DefaultStringSize:         512,     // string 类型字段的默认长度
		SkipInitializeWithVersion: false,   // 根据版本自动配置
	}
	if db, err := gorm.Open(mysql.New(mysqlConfig)); err != nil {
		return nil
	} else {
		db.InstanceSet("gorm:table_options", "ENGINE="+m.Engine)
		sqlDB, _ := db.DB()
		sqlDB.SetMaxIdleConns(m.MaxIdleConns)
		sqlDB.SetMaxOpenConns(m.MaxOpenConns)
		return db
	}
}
