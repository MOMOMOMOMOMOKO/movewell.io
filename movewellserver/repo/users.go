package repo

import (
	"context"
	"crypto/md5"
	"encoding/hex"
	"movewell/repo/dao/model"
	"movewell/repo/dao/query"
)

func Md5(password string) string {
	m := md5.New()
	m.Write([]byte(password))
	return hex.EncodeToString(m.Sum(nil))
}

func RegisterUser(ctx context.Context, u *model.User) error {
	u.Password = Md5(u.Password)
	return query.Use(DB).WithContext(ctx).User.Create(u)

}

func Login(ctx context.Context, name string, password string) (*model.User, error) {
	password = Md5(password)
	user := query.Use(DB).User
	ret, err := query.Use(DB).WithContext(ctx).User.Where(user.Username.Eq(name), user.Password.Eq(password)).First()

	if err != nil {
		return nil, err
	}

	return ret, nil

}
