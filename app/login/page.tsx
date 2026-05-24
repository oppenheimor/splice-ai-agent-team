import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import styles from "./page.module.css";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/requirements-diagnosis");
  }

  const params = await searchParams;
  const error = params?.error === "missing_identifier";

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.heading}>
          <span>V0 Auth</span>
          <h1>登录 Splice Agent Team</h1>
          <p>输入任意手机号或用户名即可创建本地演示登录态。</p>
        </div>
        <form className={styles.form} action="/agent-team/api/auth/login" method="post">
          <label htmlFor="identifier">手机号或用户名</label>
          <input
            id="identifier"
            name="identifier"
            autoComplete="username"
            placeholder="例如 13800000000"
            required
          />
          {error ? <p className={styles.error}>请输入手机号或用户名。</p> : null}
          <button type="submit">登录</button>
        </form>
      </section>
    </main>
  );
}
