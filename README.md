# Secured Software Licensing System

Using datetime encryption and handshakes to prevent Man-In-The-Middle attack, incorporated with a downloading system for softwares. Codes need to be adjusted for personal use.



## WebUtils Usage


encrypted_get_returnstring

```csharp
string s = WebUtils.encrypted_get_returnstring($"{WebUtils.siteaddress}/test", "abcdefghijklmnop");
```

```javascript
 RespondString("asd","abcdefghijklmnop",res)

```


encrypted_get_returnobject

```csharp
testclass s = WebUtils.encrypted_get_returnobject<testclass>($"{WebUtils.siteaddress}/test", "abcdefghijklmnop");
ConfigManager.config = WebUtils.encrypted_get_returnobject<RecoilConfig>($"{WebUtils.siteaddress}/test", "abcdefghijklmnop");

```

```javascript
    let j1 = JSONtoObject("asd.json")
    let j2 = JSONtoObject("sad.json")
    let a = [j1,j2]
    let j = {
        configs: a
    }
    RespondObject(j,"abcdefghijklmnop",res)

```

encrypted_post_returnstring

```csharp
testclass tc = new testclass();
tc.a = "a";
tc.b = "b";
string s = WebUtils.encrypted_post_returnstring<testclass>($"{WebUtils.siteaddress}/test2", "abcdefghijklmnop", tc, "abcdefghijklmnop", "abcdefghijklmnop");
```

```javascript
    let decrytped = DecryptPostObject(req.body,"abcdefghijklmnop","abcdefghijklmnop","abcdefghijklmnop")
    console.log(decrytped)
    RespondString("asd",decrytped.time, res)
```


encrypted_post_returnobject

```csharp
testclass ts = WebUtils.encrypted_post_returnobject($"{WebUtils.siteaddress}/test2", "abcdefghijklmnop", tc, "abcdefghijklmnop", "abcdefghijklmnop");
```

```javascript
    let decrytped = DecryptPostObject(req.body,"abcdefghijklmnop","abcdefghijklmnop","abcdefghijklmnop")
    console.log(decrytped)
    RespondObject({a:"asd",b:"sss"},decrytped.time,res)
```
